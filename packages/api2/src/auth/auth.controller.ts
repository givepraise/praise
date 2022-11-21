import { Controller, Post, Query, Get, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { NonceResponse } from './schemas/nonce-response.schema';
import { LoginDto } from './dto/login-request.dto';
import { LoginResponseDto } from './dto/login-response.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Get('nonce')
  async nonce(
    @Query('identityEthAddress') identityEthAddress: string,
  ): Promise<NonceResponse> {
    return this.authService.nonce(identityEthAddress);
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto): Promise<LoginResponseDto> {
    const { identityEthAddress, signature } = loginDto;
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
