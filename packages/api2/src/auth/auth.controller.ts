import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { NonceResponse } from './interfaces/nonce-response.interface';
import { LoginRequestDto } from './dto/login-request.dto';
import { LoginResponse } from './interfaces/login-response.interface';
import { NonceRequestDto } from './dto/nonce-request.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('nonce')
  async nonce(@Body() nonceRquestDto: NonceRequestDto): Promise<NonceResponse> {
    const { identityEthAddress } = nonceRquestDto;
    const { nonce } = await this.authService.generateUserNonce(
      identityEthAddress,
    );
    return {
      identityEthAddress,
      nonce,
    };
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
