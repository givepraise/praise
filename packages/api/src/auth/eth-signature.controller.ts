import { Controller, Post, Body, Headers } from '@nestjs/common';
import { EthSignatureService } from './eth-signature.service';
import { NonceResponseDto } from './dto/nonce-response.dto';
import { LoginResponseDto } from './dto/login-response.dto';
import { NonceInputDto } from './dto/nonce-input.dto';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { LoginInputDto } from './dto/login-input.dto';
import { ApiException } from '../shared/exceptions/api-exception';
import { errorMessages } from '../shared/exceptions/error-messages';
import { UsersService } from '../users/users.service';
import { EventLogService } from '../event-log/event-log.service';
import { EventLogTypeKey } from '../event-log/enums/event-log-type-key';
import { GenerateTokenDto } from './dto/generate-token-dto';

@Controller('auth')
@ApiTags('Authentication')
export class EthSignatureController {
  constructor(
    private readonly ethSignatureService: EthSignatureService,
    private readonly usersService: UsersService,
    private readonly eventLogService: EventLogService,
  ) {}

  @Post('eth-signature/nonce')
  @ApiOperation({
    summary: 'Generates a nonce for the user and returns it',
  })
  @ApiBody({
    type: NonceInputDto,
    description: 'A request containing the user identityEthAddress',
  })
  @ApiResponse({
    status: 201,
    description: 'Nonce generated successfully',
    type: NonceResponseDto,
  })
  async nonce(
    @Body() nonceRquestDto: NonceInputDto,
  ): Promise<NonceResponseDto> {
    const { identityEthAddress } = nonceRquestDto;
    const user = await this.usersService.generateNonce(identityEthAddress);
    if (user && user.nonce) {
      return {
        identityEthAddress,
        nonce: user.nonce,
      };
    }
    throw new ApiException(errorMessages.FAILED_TO_GENERATE_NONCE);
  }

  @Post('eth-signature/login')
  @ApiOperation({
    summary: "Verifies a user's signature and returns a JWT token",
  })
  @ApiBody({
    type: LoginInputDto,
    description:
      'A request containing the user identityEthAddress and signed' +
      'login message. The signed message should be structured as follows: \n\n' +
      '```SIGN THIS MESSAGE TO LOGIN TO PRAISE.\\n\\nADDRESS:\\n[identityEthAddress]\\n\\n' +
      'NONCE:\\n[nonce]```',
  })
  @ApiResponse({
    status: 201,
    description: 'User authenticated successfully',
    type: LoginResponseDto,
  })
  async login(
    @Headers('host') host: string,
    @Body() loginInputDto: LoginInputDto,
  ): Promise<LoginResponseDto> {
    const loginResponse = await this.ethSignatureService.login(
      loginInputDto.identityEthAddress,
      loginInputDto.signature,
      host.split(':')[0],
    );

    await this.eventLogService.logEventWithAuthContext({
      authContext: {
        userId: loginResponse.user._id,
        roles: loginResponse.user.roles,
      },
      typeKey: EventLogTypeKey.AUTHENTICATION,
      description: `User ${loginResponse.user.username} logged in`,
    });

    return loginResponse;
  }

  @Post('eth-signature/refresh')
  @ApiOperation({
    summary: 'Verifies a refreshToken  and returns a JWT token',
  })
  @ApiBody({
    type: GenerateTokenDto,
  })
  @ApiResponse({
    status: 201,
    description: 'Tokens generated successfully',
    type: LoginResponseDto,
  })
  async token(
    @Headers('host') host: string,
    @Body() generateTokenDto: GenerateTokenDto,
  ): Promise<LoginResponseDto> {
    const loginResponse =
      await this.ethSignatureService.generateTokensByRefreshToken(
        generateTokenDto.refreshToken,
        host.split(':')[0],
      );

    await this.eventLogService.logEvent({
      typeKey: EventLogTypeKey.AUTHENTICATION,
      description: `User ${loginResponse.identityEthAddress} refreshed tokens`,
    });

    return loginResponse;
  }
}
