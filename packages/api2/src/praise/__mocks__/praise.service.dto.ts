import { praiseStub } from '../test/stubs/praise.stub';

export const UsersService = jest.fn().mockReturnValue({
  findAllPaginated: jest.fn().mockResolvedValue([]),
  findOneById: jest.fn().mockResolvedValue(praiseStub),
});
