import { IsNotEmpty, IsString } from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';
import { IsEthAddress } from '@/shared/validators.shared';

export class LoginRequest {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @IsEthAddress()
  identityEthAddress: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  signature: string;
}
