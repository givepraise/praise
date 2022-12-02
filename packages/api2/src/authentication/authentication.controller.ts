import {
  Controller,
  Post,
  Body,
  InternalServerErrorException,
} from '@nestjs/common';
import { AuthenticationService } from './authentication.service';
import { NonceResponse } from './interfaces/nonce-response.interface';
import { LoginRequestDto } from './dto/login-request.dto';
import { LoginResponse } from './interfaces/login-response.interface';
import { NonceRequestDto } from './dto/nonce-request.dto';

@Controller('auth')
export class AuthenticationController {
  constructor(private authService: AuthenticationService) {}

  @Post('nonce')
  async nonce(@Body() nonceRquestDto: NonceRequestDto): Promise<NonceResponse> {
    const { identityEthAddress } = nonceRquestDto;
    const user = await this.authService.generateUserNonce(identityEthAddress);
    if (user && user.nonce) {
      return {
        identityEthAddress,
        nonce: user.nonce,
      };
    }
    throw new InternalServerErrorException('Failed to generate nonce.');
  }

  @Post('login')
  async login(
    @Body() loginRequestDto: LoginRequestDto,
  ): Promise<LoginResponse> {
    const { identityEthAddress, signature } = loginRequestDto;
    const accessToken = await this.authService.login(
      identityEthAddress,
      signature,
    );

    return {
      accessToken,
      identityEthAddress,
      tokenType: 'Bearer',
    };
  }
}
