import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class IsNameAvailableResponseDto {
  @ApiProperty({
    example: false,
  })
  @IsBoolean()
  available: boolean;
}
