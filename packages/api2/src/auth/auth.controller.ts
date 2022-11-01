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
    @Query('ethereumAddress') ethereumAddress: string,
  ): Promise<NonceResponse> {
    return this.authService.nonce(ethereumAddress);
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto): Promise<LoginResponseDto> {
    const { ethereumAddress, signature } = loginDto;
    const accessToken = await this.authService.login(
      ethereumAddress,
      signature,
    );

    return {
      accessToken,
      ethereumAddress,
      tokenType: 'Bearer',
    };
  }
}
