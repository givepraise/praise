import { Test, TestingModule } from '@nestjs/testing';
import { User } from '../schemas/users.schema';
import { UsersController } from '../users.controller';
import { UsersService } from '../users.service';
import { userStub } from './stubs/user.stub';
import { UpdateUserRoleInputDto } from '../dto/update-user-role-input.dto';
import { AuthRole } from '@/auth/enums/auth-role.enum';

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

  type UserRoleMap = keyof typeof AuthRole;
  describe('addRole', () => {
    let user: User;
    beforeEach(async () => {
      jest.clearAllMocks();
    });

    const updateUserRoleDto: UpdateUserRoleInputDto = {
      role: AuthRole[userStub.roles[0] as UserRoleMap],
    };

    test('should call usersService', async () => {
      user = await usersController.addRole(userStub._id, updateUserRoleDto);
      expect(usersService.addRole).toBeCalledWith(
        userStub._id,
        updateUserRoleDto,
      );
    });

    test('should return an object of one user', async () => {
      const userRole = await usersController.addRole(
        userStub._id,
        updateUserRoleDto,
      );
      expect(userRole).toEqual(updateUserRoleDto.role);
    });
  });

  describe('removeRole', () => {
    let user: User;
    beforeEach(async () => {
      jest.clearAllMocks();
    });

    const updateUserRoleDto: UpdateUserRoleInputDto = {
      role: AuthRole[userStub.roles[0] as UserRoleMap],
    };

    test('should call usersService', async () => {
      const userT = await usersController.removeRole(
        userStub._id,
        updateUserRoleDto,
      );
      expect(usersService.removeRole).toBeCalledWith(
        userStub._id,
        updateUserRoleDto,
      );
    });

    test('should return an object of one user', async () => {
      const userRole = await usersController.addRole(
        userStub._id,
        updateUserRoleDto,
      );
      expect(userRole).toEqual(updateUserRoleDto.role);
    });
  });
});
