import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class IsNameAvailableRequestDto {
  @ApiProperty({
    example: 'test_12345',
  })
  @IsString()
  @IsNotEmpty()
  name: string;
}
