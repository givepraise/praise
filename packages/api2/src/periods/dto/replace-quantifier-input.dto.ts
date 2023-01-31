import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class ReplaceQuantifierInputDto {
  @ApiProperty({
    example: '0xAAB27b150451726EC7738aa1d0A94505c8729bd1',
  })
  @IsString()
  @IsNotEmpty()
  currentQuantifierId: string;

  @ApiProperty({
    example: '0xAAB27b150451726EC7738aa1d0A94505c8729bd1',
  })
  @IsString()
  @IsNotEmpty()
  newQuantifierId: string;
}
