import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '@/users/users.service';
import { generateLoginMessage } from '../auth.utils';
import { ethers } from 'ethers';

@Injectable()
export class EthSignatureStrategy extends PassportStrategy(
  Strategy,
  'eth-signature',
) {
  constructor(private usersService: UsersService) {
    super({
      usernameField: 'identityEthAddress',
      passwordField: 'signature',
    });
  }

  async validate(identityEthAddress: string, signature: string): Promise<any> {
    const user = await this.usersService.findOneByEth(identityEthAddress);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Check for previously generated nonce
    if (!user.nonce) {
      throw new UnauthorizedException('Nonce not found');
    }

    // Generate expected message, nonce included.
    // Recover signer from generated message + signature
    const generatedMsg = generateLoginMessage(identityEthAddress, user.nonce);

    try {
      // Recovered signer address must match identityEthAddress
      const signerAddress = ethers.utils.verifyMessage(generatedMsg, signature);
      if (signerAddress !== identityEthAddress) throw new Error();
    } catch (e) {
      throw new UnauthorizedException('Signature verification failed');
    }

    return user;
  }
}
