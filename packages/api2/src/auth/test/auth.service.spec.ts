import { Test, TestingModule } from '@nestjs/testing';

import { AuthService } from '../auth.service';
import { UsersService } from '@/users/users.service';
import { userStub } from '@/users/test/stubs/user.stub';
import { JwtService } from '@nestjs/jwt';
import { UtilsProvider } from '@/utils/utils.provider';

jest.mock('@/users/users.service');
jest.mock('@/utils/utils.provider');

describe('AuthService', () => {
  let authService: AuthService;
  let usersService: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [],
      providers: [AuthService, UsersService, JwtService, UtilsProvider],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
  });

  describe('generateUserNonce', () => {
    test('calls usersService.update when user exists since before', async () => {
      await authService.generateUserNonce(userStub.identityEthAddress);
      expect(usersService.update).toBeCalledWith(userStub._id, {
        nonce: '1234567890',
      });
    });

    test('calls usersService.create when user does not exist', async () => {
      usersService.findOneByEth = jest.fn().mockResolvedValue(null);
      await authService.generateUserNonce(userStub.identityEthAddress);
      expect(usersService.create).toBeCalledWith({
        identityEthAddress: userStub.identityEthAddress,
        rewardsEthAddress: userStub.identityEthAddress,
        username: userStub.identityEthAddress,
        nonce: '1234567890',
      });
    });
  });
});
