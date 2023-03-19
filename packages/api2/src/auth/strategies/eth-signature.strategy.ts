import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '@/users/users.service';
import { ethers } from 'ethers';
import { EthSignatureService } from '../eth-signature.service';
import { errorMessages } from '@/utils/errorMessages';

@Injectable()
/**
 * Passport strategy for authenticating users using Ethereum signature.
 */
export class EthSignatureStrategy extends PassportStrategy(
  Strategy,
  'eth-signature',
) {
  constructor(
    private usersService: UsersService,
    private ethSignatureService: EthSignatureService,
  ) {
    super({
      usernameField: 'identityEthAddress',
      passwordField: 'signature',
    });
  }
  /**
   * Validate user signature and return user if valid.
   *
   * @param identityEthAddress
   * @param signature
   * @returns
   */
  async validate(identityEthAddress: string, signature: string): Promise<any> {
    let user;
    try {
      user = await this.usersService.findOneByEth(identityEthAddress);
    } catch (e) {
      // Throw UnauthorizedException instead of BadRequestException since
      // the user is not authenticated yet Nest.js defaults to that on
      // other authentication strategt errors
      throw new UnauthorizedException();
    }

    // Check if user has previously generated a nonce
    if (!user.nonce) {
      throw new UnauthorizedException(errorMessages.NONCE_NOT_FOUND);
    }

    // Generate expected message
    const message = this.ethSignatureService.generateLoginMessage(
      identityEthAddress,
      user.nonce,
    );

    // Verify signature
    try {
      // Recovered signer address must match identityEthAddress
      const signerAddress = ethers.utils.verifyMessage(message, signature);
      if (signerAddress !== identityEthAddress) throw new Error();
    } catch (e) {
      throw new UnauthorizedException('Signature verification failed');
    }

    // Return user if all checks pass
    return user;
  }
}
