import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class ReplaceQuantifierInputDto {
  @ApiProperty({
    example: '639b178f19296ee0f2d0585d',
    type: 'string',
  })
  @IsString()
  @IsNotEmpty()
  currentQuantifierId: string;

  @ApiProperty({
    example: '639b178f19296ee0f2d05666',
    type: 'string',
  })
  @IsString()
  @IsNotEmpty()
  newQuantifierId: string;
}
