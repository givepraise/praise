import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '@/users/users.service';
import { JwtService } from '@nestjs/jwt';
import { UtilsProvider } from '@/utils/utils.provider';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { generateLoginMessage } from './authentication.utils';
import { ethers } from 'ethers';

@Injectable()
export class EthSignatureStrategy extends PassportStrategy(
  Strategy,
  'eth-signature',
) {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private utils: UtilsProvider,
  ) {
    super({
      usernameField: 'identityEthAddress',
      passwordField: 'signature',
    });
  }

  async validate(identityEthAddress: string, signature: string): Promise<any> {
    console.log('identityEthAddress', identityEthAddress);
    console.log('signature', signature);
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
    const signerAddress = ethers.utils.verifyMessage(generatedMsg, signature);

    // Recovered signer address must match identityEthAddress
    if (signerAddress !== identityEthAddress)
      throw new UnauthorizedException('Signature verification failed');

    // await logEvent(EventLogTypeKey.AUTHENTICATION, 'Logged in', {
    //   userId: user._id,
    // });

    // Sign payload to create accesstoken
    const payload = {
      userId: user._id.toString(),
      identityEthAddress,
      roles: user.roles,
    } as JwtPayload;

    const jwt = this.jwtService.sign(payload);
    return jwt;
  }
}
