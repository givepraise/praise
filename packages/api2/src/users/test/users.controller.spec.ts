import { Test, TestingModule } from '@nestjs/testing';
import { User } from '../schemas/users.schema';
import { UsersController } from '../users.controller';
import { UsersService } from '../users.service';
import { Request } from 'express';
import { userStub } from './stubs/user.stub';
import { REQUEST } from '@nestjs/core/router/request/request-constants';
// import { REQUEST } from '@nestjs/core/router';
// import { REQUEST } from '@nestjs/core';
// import { REQUEST } from '@nestjs/core/router/request';

jest.mock('@/users/users.service');

describe('UsersController', () => {
  let usersController: UsersController;
  let usersService: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [],
      controllers: [UsersController],
      providers: [
        UsersService,
        {
          provide: REQUEST,
          useValue: Request,
        },
      ],
    }).compile();

    usersController = module.get<UsersController>(UsersController);
    usersService = module.get<UsersService>(UsersService);
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    let users: User[];
    beforeEach(async () => {
      // users = await usersController.findAll();
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
      user = await usersController.findOne(Request, userStub._id);
      expect(usersService.findOneById).toBeCalledWith(userStub._id);
    });

    // test('should return an array of one user', async () => {
    //   users = await usersController.findAll();
    //   expect(users).toEqual([userStub]);
    // });
  });
});
