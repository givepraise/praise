import { Test, TestingModule } from '@nestjs/testing';
import { User } from '../schemas/users.schema';
import { UsersController } from '../users.controller';
import { UsersService } from '../users.service';
// import { userStub } from './stubs/user.stub';

jest.mock('@/users/users.service');

describe('UsersController', () => {
  let usersController: UsersController;
  let usersService: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [],
      controllers: [UsersController],
      providers: [UsersService],
    }).compile();

    usersController = module.get<UsersController>(UsersController);
    usersService = module.get<UsersService>(UsersService);
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    let users: User[];
    beforeEach(async () => {
      users = await usersController.findAll();
      jest.clearAllMocks();
    });

    test('findAll should call usersService', async () => {
      expect(usersService.findAll).toHaveBeenCalled();
    });
  });
});
