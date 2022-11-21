import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { NonceResponseDto } from './dto/nonce-response.dto';
import { LoginRequestDto } from './dto/login-request.dto';
import { LoginResponseDto } from './dto/login-response.dto';
import { NonceRequestDto } from './dto/nonce-request.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('nonce')
  async nonce(
    @Body() nonceRquestDto: NonceRequestDto,
  ): Promise<NonceResponseDto> {
    const { identityEthAddress } = nonceRquestDto;
    return this.authService.nonce(identityEthAddress);
  }

  @Post('login')
  async login(
    @Body() loginRequestDto: LoginRequestDto,
  ): Promise<LoginResponseDto> {
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
