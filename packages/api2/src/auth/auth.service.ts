import { Injectable } from '@nestjs/common';
import { User } from '@/users/schemas/users.schema';

import { JwtService } from '@nestjs/jwt';
import { UsersService } from '@/users/users.service';
import { generateLoginMessage } from './auth.utils';
import { ethers } from 'ethers';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { UtilsProvider } from '@/utils/utils.provider';
import { ServiceException } from '@/shared/service-exception';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private utils: UtilsProvider,
  ) {}

  /**
   * Generates a nonce for the user and returns it.
   *
   * @param identityEthAddress
   * @returns NonceResponse
   */
  async generateUserNonce(identityEthAddress: string): Promise<User> {
    // Generate random nonce used for auth request
    const nonce = await this.utils.randomString();

    const user = await this.usersService.findOneByEth(identityEthAddress);

    if (user) return this.usersService.update(user._id, { nonce });

    return this.usersService.create({
      identityEthAddress,
      rewardsEthAddress: identityEthAddress,
      username: identityEthAddress,
      nonce,
    });
  }

  /**
   * Verifies a user's signature of a login message and returns a JWT token.
   *
   *  @param identityEthAddress
   *  @param signature
   *  @returns string
   */
  async login(identityEthAddress: string, signature: string): Promise<string> {
    const user = await this.usersService.findOneByEth(identityEthAddress);
    if (!user) {
      throw new ServiceException('User not found');
    }

    // Check for previously generated nonce
    if (!user.nonce) {
      throw new ServiceException('Nonce not found');
    }

    // Generate expected message, nonce included.
    // Recover signer from generated message + signature
    const generatedMsg = generateLoginMessage(identityEthAddress, user.nonce);
    const signerAddress = ethers.utils.verifyMessage(generatedMsg, signature);

    // Recovered signer address must match identityEthAddress
    if (signerAddress !== identityEthAddress)
      throw new ServiceException('Signature verification failed');

    // await logEvent(EventLogTypeKey.AUTHENTICATION, 'Logged in', {
    //   userId: user._id,
    // });

    // Sign payload to create accesstoken
    const payload = {
      userId: user._id.toString(),
      identityEthAddress,
      roles: user.roles,
    } as JwtPayload;

    return this.jwtService.sign(payload);
  }
}
