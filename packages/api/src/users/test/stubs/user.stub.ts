import { User } from '../../schemas/users.schema';
import { Types } from 'mongoose';
import { AuthRole } from '../../../auth/enums/auth-role.enum';

export const userStub: User = {
  _id: new Types.ObjectId('5f9f1c1b9b9b9b9b9b9b9b9b'),
  username: 'test',
  identityEthAddress: '0x0000000000000000000000000000000000000000',
  rewardsEthAddress: '0x0000000000000000000000000000000000000000',
  roles: [AuthRole.USER],
  accounts: [],
  nonce: 'nonce',
  createdAt: new Date(),
  updatedAt: new Date(),
};
