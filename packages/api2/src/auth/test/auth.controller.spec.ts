import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from '../auth.controller';
import { EthSignatureService } from '../eth-signature.service';
import { UsersService } from '@/users/users.service';
import { JwtService } from '@nestjs/jwt';

jest.mock('@/users/users.service');
jest.mock('@/auth/eth-signature.service');

describe('AuthController', () => {
  let authController: AuthController;
  let authService: EthSignatureService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [],
      controllers: [AuthController],
      providers: [EthSignatureService, UsersService, JwtService],
    }).compile();

    authController = module.get<AuthController>(AuthController);
    authService = module.get<EthSignatureService>(EthSignatureService);
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
      expect(authService.generateUserNonce).toBeCalledWith(
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
      authService.generateUserNonce = jest.fn().mockReturnValue(null);
      expect(authController.nonce(nonceRequestDto)).rejects.toThrowError(
        'Failed to generate nonce.',
      );
    });
  });
});
