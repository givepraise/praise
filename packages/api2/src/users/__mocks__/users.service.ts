import { userStub } from '../test/stubs/user.stub';

export const UsersService = jest.fn().mockReturnValue({
  findAll: jest.fn().mockResolvedValue([userStub]),
  findOneById: jest.fn().mockResolvedValue(userStub),
  findOneByEth: jest.fn().mockResolvedValue(userStub),
  addRole: jest
    .fn()
    .mockResolvedValue(userStub)
    .mockResolvedValue(userStub.roles[0]),
  removeRole: jest
    .fn()
    .mockResolvedValue(userStub)
    .mockResolvedValue(userStub.roles[0]),
  revokeAccess: jest.fn().mockResolvedValue(userStub),
  update: jest.fn().mockResolvedValue(userStub),
  create: jest.fn().mockResolvedValue(userStub),
  generateUserNameFromAccount: jest.fn().mockResolvedValue(userStub.username),
  generateValidUsername: jest.fn().mockResolvedValue(userStub.username),
});
