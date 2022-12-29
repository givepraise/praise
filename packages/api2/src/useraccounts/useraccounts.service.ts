import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  UserAccount,
  UserAccountDocument,
} from './schemas/useraccounts.schema';

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
   *
   * @param {Types.ObjectId} userId
   * @returns {Promise<UserAccountDocument>}
   */
  async findOneByUserId(userId: Types.ObjectId): Promise<UserAccountDocument> {
    return this.userAccountModel.findOne({ userId }).lean();
  }
}
