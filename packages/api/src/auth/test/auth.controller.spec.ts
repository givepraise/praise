import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from '../auth.controller';
import { EthSignatureService } from '../eth-signature.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { EventLogService } from '../event-log/event-log.service';

jest.mock('@/users/users.service');
jest.mock('@/auth/eth-signature.service');
jest.mock('@/event-log/event-log.service');

describe('AuthController', () => {
  let authController: AuthController;
  let ethSignatureService: EthSignatureService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [],
      controllers: [AuthController],
      providers: [
        EthSignatureService,
        UsersService,
        JwtService,
        EventLogService,
      ],
    }).compile();

    authController = module.get<AuthController>(AuthController);
    ethSignatureService = module.get<EthSignatureService>(EthSignatureService);
    jest.clearAllMocks();
  });

  describe('nonce', () => {
    beforeEach(async () => {
      jest.clearAllMocks();
    });

    test('authService.generateUserNonce should be called with correct params', async () => {
      const nonceRequestDto = {
        identityEthAddress: '0xF2f5C73fa04406b1995e397B55c24aB1f3eA726C',
      };
      await authController.nonce(nonceRequestDto);
      expect(ethSignatureService.generateUserNonce).toBeCalledWith(
        nonceRequestDto.identityEthAddress,
      );
    });

    test('should return nonce and same identityEthAddress', async () => {
      const nonceRequestDto = {
        identityEthAddress: '0xF2f5C73fa04406b1995e397B55c24aB1f3eA726C',
      };
      const nonceResponse = await authController.nonce(nonceRequestDto);
      expect(nonceResponse).toEqual({
        identityEthAddress: nonceRequestDto.identityEthAddress,
        nonce: 'nonce',
      });
    });

    test('should throw InternalServerErrorException if authService.generateUserNonce fails', async () => {
      const nonceRequestDto = {
        identityEthAddress: '0xF2f5C73fa04406b1995e397B55c24aB1f3eA726C',
      };
      ethSignatureService.generateUserNonce = jest.fn().mockReturnValue(null);
      expect(authController.nonce(nonceRequestDto)).rejects.toThrowError(
        'Failed to generate nonce.',
      );
    });
  });
});
