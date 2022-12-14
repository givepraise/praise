import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from '@/users/users.service';
import { userStub } from '@/users/test/stubs/user.stub';
import { EthSignatureStrategy } from '../strategies/eth-signature.strategy';
import { ethers } from 'ethers';
import { EthSignatureService } from '../eth-signature.service';
import { JwtModule } from '@nestjs/jwt';
import { UtilsProvider } from '@/utils/utils.provider';
import { ConstantsProvider } from '@/constants/constants.provider';
import { EventLogService } from '@/event-log/event-log.service';

jest.mock('@/users/users.service');
jest.mock('@/event-log/event-log.service');

describe('EthSignatureStrategy', () => {
  let usersService: UsersService;
  let ethSignatureStrategy: EthSignatureStrategy;
  let ethSignatureService: EthSignatureService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        JwtModule.register({
          secret: process.env.JWT_SECRET,
          signOptions: { expiresIn: process.env.JWT_ACCESS_EXP },
        }),
      ],
      providers: [
        UsersService,
        EthSignatureStrategy,
        EthSignatureService,
        UtilsProvider,
        ConstantsProvider,
        EventLogService,
      ],
    }).compile();

    usersService = module.get<UsersService>(UsersService);
    ethSignatureStrategy =
      module.get<EthSignatureStrategy>(EthSignatureStrategy);
    ethSignatureService = module.get<EthSignatureService>(EthSignatureService);
  });

  describe('validate', () => {
    test('successful validation', async () => {
      ethers.utils.verifyMessage = jest
        .fn()
        .mockReturnValue(userStub.identityEthAddress);
      const generatedMsg = ethSignatureService.generateLoginMessage(
        userStub.identityEthAddress,
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        userStub.nonce!,
      );

      const user = await ethSignatureStrategy.validate(
        userStub.identityEthAddress,
        'signature',
      );

      expect(usersService.findOneByEth).toBeCalledWith(
        userStub.identityEthAddress,
      );
      expect(ethers.utils.verifyMessage).toBeCalledWith(
        generatedMsg,
        'signature',
      );
      expect(user).toEqual(userStub);
    });

    test('identityEthAddress not found', async () => {
      usersService.findOneByEth = jest.fn().mockResolvedValue(null);

      await expect(
        ethSignatureStrategy.validate(userStub.identityEthAddress, 'signature'),
      ).rejects.toThrow('User not found');
    });

    test('user has no nonce', async () => {
      usersService.findOneByEth = jest.fn().mockResolvedValue({
        ...userStub,
        nonce: null,
      });

      await expect(
        ethSignatureStrategy.validate(userStub.identityEthAddress, 'signature'),
      ).rejects.toThrow('Nonce not found');
    });

    test('signature verification fails', async () => {
      usersService.findOneByEth = jest.fn().mockResolvedValue(userStub);
      ethers.utils.verifyMessage = jest.fn().mockReturnValue(null);
      await expect(
        ethSignatureStrategy.validate(userStub.identityEthAddress, 'signature'),
      ).rejects.toThrow('Signature verification failed');
    });
  });
});
