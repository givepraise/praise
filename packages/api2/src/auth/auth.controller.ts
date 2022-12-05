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
import { LoginResponse } from './interfaces/login-response.interface';
import { NonceRequestDto } from './dto/nonce-request.dto';
import { AuthGuard } from '@nestjs/passport';
import { User } from '@/users/schemas/users.schema';

interface RequestWithUser extends Request {
  user: User;
}

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
  async login(@Request() req: RequestWithUser): Promise<LoginResponse> {
    return this.authService.login(req.user);
  }
}
