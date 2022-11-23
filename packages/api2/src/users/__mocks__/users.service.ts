import { userStub } from '../test/stubs/user.stub';

export const UsersService = jest.fn().mockReturnValue({
  findAll: jest.fn().mockResolvedValue([]),
  findOneById: jest.fn().mockResolvedValue(userStub),
  findOneByEth: jest.fn().mockResolvedValue(userStub),
  addRole: jest.fn().mockResolvedValue(userStub),
  removeRole: jest.fn().mockResolvedValue(userStub),
  revokeAccess: jest.fn().mockResolvedValue(userStub),
  update: jest.fn().mockResolvedValue(userStub),
  create: jest.fn().mockResolvedValue(userStub),
});
