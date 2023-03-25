import { Injectable } from '@nestjs/common';
import { User } from '@/users/schemas/users.schema';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '@/users/users.service';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { LoginResponseDto } from './dto/login-response.dto';
import { EventLogService } from '@/event-log/event-log.service';
import { EventLogTypeKey } from '@/event-log/enums/event-log-type-key';
import { Types } from 'mongoose';
import { ServiceException } from '@/shared/exceptions/service-exception';
import { randomBytes } from 'crypto';
import { errorMessages } from '@/utils/errorMessages';

@Injectable()
/**
 * Authenticate users using their Ethereum signature.
 */
export class EthSignatureService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly eventLogService: EventLogService,
  ) {}

  /**
   * Generates a nonce for the user and returns it.
   *
   * @param identityEthAddress Ethereum address of the user
   * @returns User with updated nonce
   */
  async generateUserNonce(identityEthAddress: string): Promise<User> {
    // Generate random nonce used for auth request
    const nonce = randomBytes(10).toString('hex');

    try {
      // Find user by their Ethereum address, update nonce
      const user = await this.usersService.findOneByEth(identityEthAddress);
      return this.usersService.update(user._id, { nonce });
    } catch (e) {
      // No user found, create a new user
      return this.usersService.create({
        identityEthAddress,
        rewardsEthAddress: identityEthAddress,
        username: await this.usersService.generateValidUsername(
          identityEthAddress,
        ),
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
  async login(userId: Types.ObjectId): Promise<LoginResponseDto> {
    const user = await this.usersService.findOneById(userId);
    if (!user) throw new ServiceException(errorMessages.USER_NOT_FOUND);

    const { identityEthAddress, roles } = user;

    // Create payload for the JWT token
    const payload: JwtPayload = {
      userId: userId.toString(),
      identityEthAddress,
      roles,
    } as JwtPayload;

    // Sign payload to create access token
    const accessToken = this.jwtService.sign(payload, {
      expiresIn: '7d',
    });

    await this.eventLogService.logEvent({
      typeKey: EventLogTypeKey.AUTHENTICATION,
      description: 'Logged in',
    });

    // Return login response with access token
    return {
      accessToken,
      identityEthAddress,
      tokenType: 'Bearer',
    };
  }
}
