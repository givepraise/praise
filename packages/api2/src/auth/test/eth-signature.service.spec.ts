import { Test, TestingModule } from '@nestjs/testing';

import { EthSignatureService } from '../eth-signature.service';
import { UsersService } from '@/users/users.service';
import { userStub } from '@/users/test/stubs/user.stub';
import { JwtService } from '@nestjs/jwt';
import { UtilsProvider } from '@/utils/utils.provider';
import { LoginResponseDto } from '../dto/login-response.dto';
import { accessTokenStub } from './stubs/access-token';
import { EventLogService } from '@/event-log/event-log.service';

jest.mock('@/users/users.service');
jest.mock('@/utils/utils.provider');
jest.mock('@/event-log/event-log.service');

const mockJwtService = {
  sign: jest.fn().mockReturnValue(accessTokenStub),
};

describe('EthSignatureService', () => {
  let ethSignatureService: EthSignatureService;
  let usersService: UsersService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [],
      providers: [
        EthSignatureService,
        UsersService,
        UtilsProvider,
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        EventLogService,
      ],
    }).compile();

    ethSignatureService = module.get<EthSignatureService>(EthSignatureService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
  });

  describe('generateUserNonce', () => {
    test('calls usersService.update when user exists since before', async () => {
      await ethSignatureService.generateUserNonce(userStub.identityEthAddress);
      expect(usersService.update).toBeCalledWith(userStub._id, {
        nonce: '1234567890',
      });
    });

    test('calls usersService.create when user does not exist', async () => {
      usersService.findOneByEth = jest.fn().mockResolvedValue(null);
      await ethSignatureService.generateUserNonce(userStub.identityEthAddress);
      expect(usersService.create).toBeCalledWith({
        identityEthAddress: userStub.identityEthAddress,
        rewardsEthAddress: userStub.identityEthAddress,
        username: userStub.identityEthAddress,
        nonce: '1234567890',
      });
    });
  });

  describe('generateLoginMessage', () => {
    it('should be defined', () => {
      const msg =
        'SIGN THIS MESSAGE TO LOGIN TO PRAISE.\n\n' +
        `ADDRESS:\n0x123\n\n` +
        `NONCE:\n456`;

      expect(ethSignatureService.generateLoginMessage('0x123', '456')).toEqual(
        msg,
      );
    });
  });

  describe('login', () => {
    test('calls jwtService.sign with correct payload', async () => {
      await ethSignatureService.login(userStub._id);
      expect(jwtService.sign).toBeCalledWith(
        {
          userId: userStub._id.toString(),
          identityEthAddress: userStub.identityEthAddress,
          roles: userStub.roles,
        },
        {
          expiresIn: '7d',
        },
      );
    });
    test('returns correct response', async () => {
      const response = await ethSignatureService.login(userStub._id);
      expect(response).toEqual<LoginResponseDto>({
        accessToken: accessTokenStub,
        identityEthAddress: userStub.identityEthAddress,
        tokenType: 'Bearer',
      });
    });
  });
});
