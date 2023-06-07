import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { LoginResponseDto } from './dto/login-response.dto';
import { EventLogService } from '../event-log/event-log.service';
import { ApiException } from '../shared/exceptions/api-exception';
import { errorMessages } from '../shared/exceptions/error-messages';
import { HOSTNAME_TEST } from '../constants/constants.provider';
import { ethers } from 'ethers';
import { User, UserDocument } from '../users/schemas/users.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
/**
 * Authenticate users using their Ethereum signature.
 */
export class EthSignatureService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly eventLogService: EventLogService,
    @InjectModel(User.name)
    private userModel: Model<UserDocument>,
  ) {}

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
   * @returns LoginResponse
   */
  async login(
    identityEthAddress: string,
    signature: string,
    hostname: string,
  ): Promise<LoginResponseDto> {
    let user: User;
    try {
      user = await this.userModel.findOne({ identityEthAddress }).lean();
    } catch (e) {
      // Throw UnauthorizedException instead of BadRequestException since
      // the user is not authenticated yet Nest.js defaults to that on
      // other authentication strategt errors
      throw new ApiException(errorMessages.UNAUTHORIZED);
    }

    // Check if user has previously generated a nonce
    if (!user.nonce) {
      throw new ApiException(errorMessages.NONCE_NOT_FOUND);
    }

    // Generate expected message
    const message = this.generateLoginMessage(identityEthAddress, user.nonce);

    // Verify signature
    try {
      // Recovered signer address must match identityEthAddress
      const signerAddress = ethers.utils.verifyMessage(message, signature);
      if (signerAddress !== identityEthAddress) throw new Error();
    } catch (e) {
      throw new UnauthorizedException('Signature verification failed');
    }

    const { roles } = user;

    // Create payload for the JWT token
    const payload: JwtPayload = {
      userId: user._id.toString(),
      identityEthAddress,
      roles,
      hostname: process.env.NODE_ENV === 'testing' ? HOSTNAME_TEST : hostname,
    } as JwtPayload;

    // Sign payload to create access token
    const accessToken = this.jwtService.sign(
      {
        ...payload,
        type: 'access',
      },
      {
        expiresIn: '7d',
        secret: process.env.JWT_SECRET,
      },
    );

    // Sign payload to create refresh token
    const refreshToken = this.jwtService.sign(
      {
        ...payload,
        type: 'refresh',
      },
      {
        expiresIn: '30d',
        secret: process.env.JWT_SECRET,
      },
    );

    // Return login response with access token
    return {
      accessToken,
      identityEthAddress,
      refreshToken,
      tokenType: 'Bearer',
    };
  }

  /**
   * Generate new tokens with existing refreshToken.
   *
   * @param token String
   * @param hostname String
   * @returns LoginResponse
   */
  async generateTokensByRefreshToken(
    token: string,
    hostname: string,
  ): Promise<LoginResponseDto> {
    const accessTokenPayload = this.jwtService.verify(token, {
      secret: process.env.JWT_SECRET,
    }) as JwtPayload;

    const expectedHostname =
      process.env.NODE_ENV === 'testing' ? HOSTNAME_TEST : hostname;

    if (
      expectedHostname !== accessTokenPayload.hostname ||
      accessTokenPayload.type !== 'refresh'
    ) {
      throw new ApiException(errorMessages.UNAUTHORIZED);
    }
    const payload = {
      identityEthAddress: accessTokenPayload.identityEthAddress,
      hostname: accessTokenPayload.hostname,
      roles: accessTokenPayload.roles,
      userId: accessTokenPayload.userId,
    };

    // Sign payload to create access token
    const accessToken = this.jwtService.sign(
      {
        ...payload,
        type: 'access',
      },
      {
        expiresIn: '7d',
        secret: process.env.JWT_SECRET,
      },
    );

    // Sign payload to create refresh token
    const refreshToken = this.jwtService.sign(
      {
        ...payload,
        type: 'refresh',
      },
      {
        expiresIn: '30d',
        secret: process.env.JWT_SECRET,
      },
    );

    // Return login response with access token
    return {
      accessToken,
      identityEthAddress: payload.identityEthAddress,
      refreshToken,
      tokenType: 'Bearer',
      user,
    };
  }
}
