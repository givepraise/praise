import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class ReplaceQuantifierInputDto {
  @ApiProperty({
    example: '639b178f19296ee0f2d0585d',
  })
  @IsString()
  @IsNotEmpty()
  currentQuantifierId: string;

  @ApiProperty({
    example: '639b178f19296ee0f2d05666',
  })
  @IsString()
  @IsNotEmpty()
  newQuantifierId: string;
}
