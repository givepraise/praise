import * as fs from 'fs';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  UserAccount,
  UserAccountDocument,
  UserAccountsExportSqlSchema,
} from './schemas/useraccounts.schema';
import {
  UpdateUserAccountInputDto,
} from './dto/update-user-account-input.dto';
import { ServiceException } from '@/shared/exceptions/service-exception';
import {
  generateParquetExport,
  writeCsvAndJsonExports,
} from '@/shared/export.shared';
import { CreateUserAccountDto } from './dto/create-user-account-input-dto';
import { EventLogService } from '@/event-log/event-log.service';
import { EventLogTypeKey } from '@/event-log/enums/event-log-type-key';
import { UsersService } from '@/users/users.service';

@Injectable()
export class UserAccountsService {
  constructor(
    @InjectModel(UserAccount.name)
    private userAccountModel: Model<UserAccountDocument>,
    private userService: UsersService,
    private readonly eventLogService: EventLogService,
  ) {}

  getModel(): Model<UserAccountDocument> {
    return this.userAccountModel;
  }

  /**
   * Creates a new UserAccount key.
   * @param {CreateUserAccountDto} createUserAccountDto - The request payload containing the UserAccount Details
   * @returns {Promise<UserAccount>} A promise that resolves to the response containing the created UserAccount.
   * @throws {ServiceException}, If there is an error while creating the UserAccount key.
   */
  async createUserAccount(
    createUserAccountDto: CreateUserAccountDto,
  ): Promise<UserAccount> {
    const user = await this.userService.findOneById(
      new Types.ObjectId(createUserAccountDto.userId),
    );

    if (!user) throw new ServiceException('User not found.');

    const userAccount = new this.userAccountModel({
      ...createUserAccountDto,
      user,
    });
    await userAccount.save();

    this.eventLogService.logEvent({
      typeKey: EventLogTypeKey.USER_ACCOUNT,
      description: `Created UserAccount id: ${userAccount.accountId}`,
    });

    return userAccount;
  }

  async updateByUserIdAndAccountId(
    userId: Types.ObjectId,
    accountId: string,
    updateUserAccountDto: UpdateUserAccountInputDto,
  ): Promise<UserAccount> {
    const userAccount = await this.userAccountModel.findOneAndUpdate(
      { user: userId, accountId },
      updateUserAccountDto,
      { upsert: true, new: true },
    );

    if (!userAccount) throw new ServiceException('UserAccount not found.');
    return userAccount;
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
      .populate('user')
      .lean();
    if (!userAccount) return null;
    return userAccount;
  }

    /**
   * Returns a user account by user account ID
   */
    async findOneByUserIdAndAccountId(
      userId: Types.ObjectId,
      accountId: string,
    ): Promise<UserAccount | null> {
      const userAccount = await this.userAccountModel
        .findOne({ user: userId, accountId })
        .populate('user')
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
   * Update a user account by _id
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
