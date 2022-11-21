import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { User, UserDocument } from '@/users/schemas/users.schema';

import { InjectModel } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import { Model } from 'mongoose';
import { NonceResponse } from './schemas/nonce-response.schema';
import { UsersService } from '@/users/users.service';
import { randomString } from '@/shared/random.shared';
import { generateLoginMessage } from './auth.utils';
import { ethers } from 'ethers';
import { JwtPayload } from './dto/jwt-payload.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name)
    private userModel: Model<UserDocument>,
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  /**
   * Generates a nonce for the user and returns it.
   *
   * @param ethereumAddress
   * @returns NonceResponse
   */
  async nonce(ethereumAddress: string): Promise<NonceResponse> {
    // Generate random nonce used for auth request
    const nonce = randomString();

    // Update existing user or create new
    await this.userModel.findOneAndUpdate(
      { ethereumAddress },
      { nonce },
      { upsert: true, new: true },
    );

    return { ethereumAddress, nonce };
  }

  /**
   * Verifies a user's signature of a login message and returns a JWT token.
   *
   *  @param ethereumAddress
   *  @param signature
   *  @returns string
   */
  async login(ethereumAddress: string, signature: string): Promise<string> {
    const user = await this.usersService.findOneByEth(ethereumAddress);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check for previously generated nonce
    if (!user.nonce) {
      throw new BadRequestException('Nonce not found');
    }

    // Generate expected message, nonce included.
    // Recover signer from generated message + signature
    const generatedMsg = generateLoginMessage(ethereumAddress, user.nonce);
    const signerAddress = ethers.utils.verifyMessage(generatedMsg, signature);
    if (signerAddress !== ethereumAddress)
      throw new BadRequestException('Signature verification failed');

    // await logEvent(EventLogTypeKey.AUTHENTICATION, 'Logged in', {
    //   userId: user._id,
    // });

    // Sign payload to create accesstoken
    const payload = {
      userId: user._id.toString(),
      ethereumAddress,
      roles: user.roles,
    } as JwtPayload;

    return this.jwtService.sign(payload);
  }
}
