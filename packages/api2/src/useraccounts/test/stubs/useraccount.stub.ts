import { UserAccount } from '@/useraccounts/schemas/useraccounts.schema';
import { userStub } from '@/users/test/stubs/user.stub';
import { Types } from 'mongoose';

export const userAccountStub: UserAccount = {
  _id: new Types.ObjectId('621f79e143b89009366c841c'),
  user: userStub._id,
  accountId: 'DISCORD:810180621930070088:810180622336262195',
  name: 'DISCORD:Token%20Engineering%20Commons:%F0%9F%99%8F%EF%BD%9Cpraise',
  avatarId: 'DISCORD:810180621930070088:810180622336262195',
  platform: 'DISCORD',
  activateToken: 'DISCORD:810180621930070088:810180622336262195',
};
