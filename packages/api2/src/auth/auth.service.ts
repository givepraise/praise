import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { User, UserDocument } from '@/users/schemas/users.schema';

import { InjectModel } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import { Model } from 'mongoose';
import { NonceResponseDto } from './dto/nonce-response.dto';
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
   * @param identityEthAddress
   * @returns NonceResponse
   */
<<<<<<< Updated upstream
  async nonce(identityEthAddress: string): Promise<NonceResponseDto> {
=======
<<<<<<< Updated upstream
  async nonce(ethereumAddress: string): Promise<NonceResponse> {
>>>>>>> Stashed changes
    // Generate random nonce used for auth request
=======
  async nonce(identityEthAddress: string): Promise<NonceResponseDto> {
>>>>>>> Stashed changes
    const nonce = randomString();

    const user = await this.usersService.findOneByEth(identityEthAddress);

    if (!user) {
      this.usersService.updateUser(user._id, {nonce});
    // Generate random nonce used for auth request

    // Update existing user or create new
    await this.userModel.findOneAndUpdate(
      { identityEthAddress },
      { nonce },
      { upsert: true, new: true },
    );

    return { identityEthAddress, nonce };
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
      throw new NotFoundException('User not found');
    }

    // Check for previously generated nonce
    if (!user.nonce) {
      throw new BadRequestException('Nonce not found');
    }

    // Generate expected message, nonce included.
    // Recover signer from generated message + signature
    const generatedMsg = generateLoginMessage(identityEthAddress, user.nonce);
    const signerAddress = ethers.utils.verifyMessage(generatedMsg, signature);
    if (signerAddress !== identityEthAddress)
      throw new BadRequestException('Signature verification failed');

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
