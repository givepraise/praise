import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  UserAccount,
  UserAccountDocument,
} from './schemas/useraccounts.schema';
import { UpdateUserAccountInputDto } from './dto/update-user-account-input.dto';
import { ServiceException } from '@/shared/service-exception';
import { parse } from 'json2csv';

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
   * returns all of the model in json format
   */
  async export(format = 'csv'): Promise<UserAccount[] | string> {
    const userAccounts = await this.userAccountModel.find().lean();

    if (format !== 'csv') return userAccounts;
    return parse(userAccounts);
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
}
