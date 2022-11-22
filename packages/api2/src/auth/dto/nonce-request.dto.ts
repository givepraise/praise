import { IsNotEmpty, IsString } from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

export class NonceRequestDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  identityEthAddress: string;
}
