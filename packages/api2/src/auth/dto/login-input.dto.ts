import { IsNotEmpty, IsString } from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';
import { IsEthAddress } from '@/shared/validators.shared';

export class LoginInputDto {
  @ApiProperty({
    example: '0xAAB27b150451726EC7738aa1d0A94505c8729bd1',
    type: 'string',
  })
  @IsNotEmpty()
  @IsString()
  @IsEthAddress()
  identityEthAddress: string;

  @ApiProperty({ type: 'string' })
  @IsNotEmpty()
  @IsString()
  signature: string;
}
