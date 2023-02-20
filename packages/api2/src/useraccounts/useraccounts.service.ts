import * as fs from 'fs';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  UserAccount,
  UserAccountDocument,
  UserAccountsExportSqlSchema,
} from './schemas/useraccounts.schema';
import { UpdateUserAccountInputDto } from './dto/update-user-account-input.dto';
import { ServiceException } from '@/shared/exceptions/service-exception';
import {
  generateParquetExport,
  writeCsvAndJsonExports,
} from '@/shared/export.shared';

@Injectable()
export class UserAccountsService {
  constructor(
    @InjectModel(UserAccount.name)
    private userAccountModel: Model<UserAccountDocument>,
  ) {}

  getModel(): Model<UserAccountDocument> {
    return this.userAccountModel;
  }

  /**
   * Returns a user account by user ID
   */
  async findOneByUserId(userId: Types.ObjectId): Promise<UserAccount | null> {
    const userAccount = await this.userAccountModel.findOne({ userId }).lean();
    if (!userAccount) return null;
    return userAccount;
  }

  /**
   * Returns a user account by user account ID
   */
  async findOneByUserAccountId(
    userAccountId: string,
  ): Promise<UserAccount | null> {
    const userAccount = await this.userAccountModel
      .findOne({ userAccountId })
      .lean();
    if (!userAccount) return null;
    return userAccount;
  }

  /**
   * Find the latest added user account
   */
  async findLatest(): Promise<UserAccount> {
    const userAccount = await this.userAccountModel
      .find()
      .limit(1)
      .sort({ $natural: -1 })
      .lean();
    if (!userAccount[0]) throw new ServiceException('UserAccount not found.');
    return userAccount[0];
  }

  /**
   * Update a user account
   */
  async update(
    _id: Types.ObjectId,
    updateUserAccountDto: UpdateUserAccountInputDto,
  ): Promise<UserAccount> {
    const userAccountDocument = await this.userAccountModel.findById(_id);
    if (!userAccountDocument)
      throw new ServiceException('UserAccount not found.');

    for (const [k, v] of Object.entries(updateUserAccountDto)) {
      userAccountDocument.set(k, v);
    }

    await userAccountDocument.save();
    return userAccountDocument.toObject();
  }

  /**
   * Generates all export files - csv, json and parquet
   */
  async generateAllExports(path: string) {
    const includeFields = [
      '_id',
      'accountId',
      'user',
      'name',
      'avatarId',
      'platform',
      'createdAt',
      'updatedAt',
    ];

    // Count the number of documents that matches query
    const count = await this.userAccountModel.countDocuments({});

    // If there are no documents, create empty files and return
    if (count === 0) {
      fs.writeFileSync(`${path}/useraccounts.csv`, includeFields.join(','));
      fs.writeFileSync(`${path}/useraccounts.json`, '[]');
      return;
    }

    // Lookup the periods, create a cursor
    const useraccounts = this.userAccountModel.aggregate([]).cursor();

    // Write the csv and json files
    await writeCsvAndJsonExports(
      'useraccounts',
      useraccounts,
      path,
      includeFields,
    );

    // Generate the parquet file
    await generateParquetExport(
      path,
      'useraccounts',
      UserAccountsExportSqlSchema,
    );
  }
}
