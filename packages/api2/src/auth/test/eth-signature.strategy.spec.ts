import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from '@/users/users.service';
import { userStub } from '@/users/test/stubs/user.stub';
import { EthSignatureStrategy } from '../strategies/eth-signature.strategy';
import { ethers } from 'ethers';
import { generateLoginMessage } from '../auth.utils';

jest.mock('@/users/users.service');

describe('EthSignatureStrategy', () => {
  let usersService: UsersService;
  let ethSignatureStrategy: EthSignatureStrategy;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [],
      providers: [UsersService, EthSignatureStrategy],
    }).compile();

    usersService = module.get<UsersService>(UsersService);
    ethSignatureStrategy =
      module.get<EthSignatureStrategy>(EthSignatureStrategy);
  });

  describe('validate', () => {
    test('successful validation', async () => {
      ethers.utils.verifyMessage = jest
        .fn()
        .mockReturnValue(userStub.identityEthAddress);
      const generatedMsg = generateLoginMessage(
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
