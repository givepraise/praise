import { Injectable } from '@nestjs/common';
import { User } from '@/users/schemas/users.schema';

import { JwtService } from '@nestjs/jwt';
import { UsersService } from '@/users/users.service';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { UtilsProvider } from '@/utils/utils.provider';
import { LoginResponse } from './interfaces/login-response.interface';

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
   *  @returns LoginResponse
   */
  async login(user: User): Promise<LoginResponse> {
    const { _id: userId, identityEthAddress, roles } = user;

    // Sign payload to create accesstoken
    const payload = {
      userId: userId.toString(),
      identityEthAddress,
      roles,
    } as JwtPayload;
    const accessToken = this.jwtService.sign(payload);

    // await logEvent(EventLogTypeKey.AUTHENTICATION, 'Logged in', {
    //   userId: user._id,
    // });

    return {
      accessToken,
      identityEthAddress,
      tokenType: 'Bearer',
    };
  }
}
