import { Injectable } from '@nestjs/common';
import { ActivateInputDto } from './dto/activate-input.dto';
import { ServiceException } from '@/shared/service-exception';
import { UserAccountsService } from '@/useraccounts/useraccounts.service';
import { ethers } from 'ethers';
import { UsersService } from '@/users/users.service';
import { EventLogService } from '@/event-log/event-log.service';
import { EventLogTypeKey } from '@/event-log/enums/event-log-type-key';
import { User } from '@/users/schemas/users.schema';

@Injectable()
export class ActivateService {
  constructor(
    private userAccountsService: UserAccountsService,
    private usersService: UsersService,
    private eventLogService: EventLogService,
  ) {}

  /**
   * Generate an activation message that will be signed by the frontend user, and validated by the api
   */
  generateActivateMessage = (
    accountId: string,
    identityEthAddress: string,
    token: string,
  ): string => {
    return (
      'SIGN THIS MESSAGE TO ACTIVATE YOUR ACCOUNT.\n\n' +
      `ACCOUNT ID:\n${accountId}\n\n` +
      `ADDRESS:\n${identityEthAddress}\n\n` +
      `TOKEN:\n${token}`
    );
  };

  /**
   * Activate a user account in order to be able to give praise and receive rewards. Activation a user account
   * creates a new User object or adds user account to User if it already exists.
   */
  async activate(activateInputDto: ActivateInputDto): Promise<User> {
    const { identityEthAddress, signature, accountId } = activateInputDto;

    if (!identityEthAddress || !signature || !accountId)
      throw new ServiceException(
        'identityEthAddress, signature, and accountId required',
      );

    const userAccountModel = this.userAccountsService.getModel();

    const userAccount = await userAccountModel
      .findOne({ accountId })
      .select('_id user name activateToken')
      .exec();

    if (!userAccount) throw new ServiceException('UserAccount not found');

    if (!userAccount.activateToken)
      throw new ServiceException('Activation token not found');

    if (userAccount.user)
      throw new ServiceException('User account already activated');

    // Generate expected message, token included.
    const generatedMsg = this.generateActivateMessage(
      accountId,
      identityEthAddress,
      userAccount.activateToken,
    );

    // Verify signature against generated message
    // Recover signer and compare against query address
    const signerAddress = ethers.utils.verifyMessage(generatedMsg, signature);
    if (signerAddress !== identityEthAddress) {
      throw new ServiceException('Verification failed');
    }

    // Find existing user or create new
    let user = await this.usersService.findOneByEth(identityEthAddress);
    if (!user) {
      const username =
        (await this.usersService.generateUserNameFromAccount(userAccount)) ||
        identityEthAddress;
      user = await this.usersService.create({
        identityEthAddress,
        rewardsEthAddress: identityEthAddress,
        username,
      });

      if (!user) throw new ServiceException('User creation failed');
    }

    // Link user account with user
    await this.userAccountsService.update(userAccount._id, {
      user: user._id,
      activateToken: undefined,
    });

    user = await this.usersService.findOneById(user._id);
    if (!user) {
      throw new ServiceException('User not found after update');
    }

    // Log event
    await this.eventLogService.logEvent({
      typeKey: EventLogTypeKey.AUTHENTICATION,
      description: 'Activated account',
      userAccount: userAccount._id,
      user: user._id,
    });

    return user;
  }
}
