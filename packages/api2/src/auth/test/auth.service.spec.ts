import { Test, TestingModule } from '@nestjs/testing';

import { AuthService } from '../auth.service';
import { UsersService } from '@/users/users.service';
import { userStub } from '@/users/test/stubs/user.stub';
import { JwtService } from '@nestjs/jwt';
import { UtilsProvider } from '@/utils/utils.provider';
import { LoginResponse } from '../interfaces/login-response.interface';
import { accessTokenStub } from './stubs/access-token';

jest.mock('@/users/users.service');
jest.mock('@/utils/utils.provider');

const mockJwtService = {
  sign: jest.fn().mockReturnValue(accessTokenStub),
};

describe('AuthService', () => {
  let authService: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [],
      providers: [
        AuthService,
        UsersService,
        UtilsProvider,
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
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

  describe('login', () => {
    test('calls jwtService.sign with correct payload', async () => {
      await authService.login(userStub);
      expect(jwtService.sign).toBeCalledWith({
        userId: userStub._id.toString(),
        identityEthAddress: userStub.identityEthAddress,
        roles: userStub.roles,
      });
    });
    test('returns correct response', async () => {
      const response = await authService.login(userStub);
      expect(response).toEqual<LoginResponse>({
        accessToken: accessTokenStub,
        identityEthAddress: userStub.identityEthAddress,
        tokenType: 'Bearer',
      });
    });
  });
});
