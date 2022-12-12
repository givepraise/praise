import { Test, TestingModule } from '@nestjs/testing';
import { User } from '../schemas/users.schema';
import { UsersController } from '../users.controller';
import { UsersService } from '../users.service';
import { userStub } from './stubs/user.stub';
import { UpdateUserRoleDto } from '../dto/update-user-role.dto';

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
      jest.clearAllMocks();
    });

    test('should call usersService', async () => {
      users = await usersController.findAll();
      expect(usersService.findAll).toHaveBeenCalled();
    });

    test('should return an array of users', async () => {
      users = await usersController.findAll();
      expect(users).toEqual([userStub]);
    });
  });

  describe('findOne', () => {
    let user: User;
    beforeEach(async () => {
      jest.clearAllMocks();
    });

    test('should call usersService', async () => {
      user = await usersController.findOne(userStub._id);
      expect(usersService.findOneById).toBeCalledWith(userStub._id);
    });

    test('should return an object of one user', async () => {
      user = await usersController.findOne(userStub._id);
      expect(user).toEqual(userStub);
    });
  });

  describe('addRole', () => {
    let user: User;
    beforeEach(async () => {
      jest.clearAllMocks();
    });

    test('should call usersService', async () => {
      const updateUserRoleDto: UpdateUserRoleDto = {
        role: userStub.roles[0],
      };

      user = await usersController.addRole(userStub._id, updateUserRoleDto);
      expect(usersService.addRole).toBeCalledWith(userStub._id);
    });

    // test('should return an object of one user', async () => {
    //   user = await usersController.findOne(userStub._id);
    //   expect(user).toEqual(userStub);
    // });
  });
});
