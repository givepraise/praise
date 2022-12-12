import { Injectable } from '@nestjs/common';
import { User } from '@/users/schemas/users.schema';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '@/users/users.service';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { UtilsProvider } from '@/utils/utils.provider';
import { LoginResponse } from './dto/login-response.dto';

@Injectable()
/**
 * Authenticate users using their Ethereum signature.
 */
export class EthSignatureService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly utils: UtilsProvider,
  ) {}

  /**
   * Generates a nonce for the user and returns it.
   *
   * @param identityEthAddress Ethereum address of the user
   * @returns User with updated nonce
   */
  async generateUserNonce(identityEthAddress: string): Promise<User> {
    // Generate random nonce used for auth request
    const nonce = await this.utils.randomString();

    // Find user by their Ethereum address
    const user = await this.usersService.findOneByEth(identityEthAddress);

    if (user) {
      // Update user's nonce
      return this.usersService.update(user._id, { nonce });
    } else {
      // Create a new user
      return this.usersService.create({
        identityEthAddress,
        rewardsEthAddress: identityEthAddress,
        username: identityEthAddress,
        nonce,
      });
    }
  }

  /**
   * Generates a login message that will be signed by the frontend user, and validated by the API.
   *
   * @param account Ethereum address of the user
   * @param nonce Random nonce used for authentication
   * @returns string Login message
   */
  generateLoginMessage(account: string, nonce: string): string {
    return (
      'SIGN THIS MESSAGE TO LOGIN TO PRAISE.\n\n' +
      `ADDRESS:\n${account}\n\n` +
      `NONCE:\n${nonce}`
    );
  }

  /**
   * Logs in the user and returns a JWT token.
   *
   * @param user User object with information about the user
   * @returns LoginResponse
   */
  async login(user: User): Promise<LoginResponse> {
    const { _id: userId, identityEthAddress, roles } = user;

    // Create payload for the JWT token
    const payload: JwtPayload = {
      userId: userId.toString(),
      identityEthAddress,
      roles,
    } as JwtPayload;

    // Sign payload to create access token
    const accessToken = this.jwtService.sign(payload);

    // await logEvent(EventLogTypeKey.AUTHENTICATION, 'Logged in', {
    //   userId: user._id,
    // });

    // Return login response with access token
    return {
      accessToken,
      identityEthAddress,
      tokenType: 'Bearer',
    };
  }
}