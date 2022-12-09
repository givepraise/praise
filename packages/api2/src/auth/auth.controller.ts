import {
  Controller,
  Post,
  Body,
  InternalServerErrorException,
  UseGuards,
  Request,
} from '@nestjs/common';
import { EthSignatureService } from './eth-signature.service';
import { NonceResponse } from './dto/nonce-response.dto';
import { LoginResponse } from './dto/login-response.dto';
import { NonceRequest } from './dto/nonce-request.dto';
import { AuthGuard } from '@nestjs/passport';
import { RequestWithUser } from './interfaces/request-with-user.interface';
import { ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { LoginRequest } from './dto/login-request.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly ethSignatureService: EthSignatureService) {}

  @Post('eth-signature/nonce')
  @ApiOperation({
    summary: 'Generates a nonce for the user and returns it',
  })
  @ApiBody({
    type: NonceRequest,
    description: 'A request containing the user identityEthAddress',
  })
  @ApiResponse({
    status: 201,
    description: 'Nonce generated successfully',
    type: NonceResponse,
  })
  async nonce(@Body() nonceRquestDto: NonceRequest): Promise<NonceResponse> {
    const { identityEthAddress } = nonceRquestDto;
    const user = await this.ethSignatureService.generateUserNonce(
      identityEthAddress,
    );
    if (user && user.nonce) {
      return {
        identityEthAddress,
        nonce: user.nonce,
      };
    }
    throw new InternalServerErrorException('Failed to generate nonce.');
  }

  @UseGuards(AuthGuard('eth-signature'))
  @Post('eth-signature/login')
  @ApiOperation({
    summary: "Verifies a user's signature and returns a JWT token",
  })
  @ApiBody({
    type: LoginRequest,
    description:
      'A request containing the user identityEthAddress and signed' +
      'login message. The signed message should be structured as follows: \n\n' +
      '```SIGN THIS MESSAGE TO LOGIN TO PRAISE.\\n\\nADDRESS:\\n[identityEthAddress]\\n\\n' +
      'NONCE:\\n[nonce]```',
  })
  @ApiResponse({
    status: 201,
    description: 'User authenticated successfully',
    type: LoginResponse,
  })
  async login(@Request() req: RequestWithUser): Promise<LoginResponse> {
    return this.ethSignatureService.login(req.user);
  }
}
