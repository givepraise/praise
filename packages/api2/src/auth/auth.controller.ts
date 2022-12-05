import {
  Controller,
  Post,
  Body,
  InternalServerErrorException,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { NonceResponse } from './interfaces/nonce-response.interface';
import { LoginRequestDto } from './dto/login-request.dto';
import { LoginResponse } from './interfaces/login-response.interface';
import { NonceRequestDto } from './dto/nonce-request.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

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

  @UseGuards(AuthGuard('eth-signature'))
  @Post('login')
  async login(@Request() req: Request) {
    console.log(req);
    return req;
  }

  // @Post('login')
  // async login(
  //   @Body() loginRequestDto: LoginRequestDto,
  // ): Promise<LoginResponse> {
  //   const { identityEthAddress, signature } = loginRequestDto;
  //   const accessToken = await this.authService.login(
  //     identityEthAddress,
  //     signature,
  //   );

  //   return {
  //     accessToken,
  //     identityEthAddress,
  //     tokenType: 'Bearer',
  //   };
  // }
}
