import { QuantifyInputDto } from './quantify-input.dto';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty, ValidateNested } from 'class-validator';

export class QuantifyMultipleInputDto {
  @ApiProperty({ type: QuantifyInputDto })
  @ValidateNested()
  @Type(() => QuantifyInputDto)
  @IsNotEmpty()
  params: QuantifyInputDto;

  @ApiProperty({
    example: [
      '639b178f19296ee0f2d0585d',
      '639b178f19296ee0f2d0585e',
      '639b178f19296ee0f2d0585f',
    ],
    type: ['string'],
  })
  @IsNotEmpty()
  praiseIds: string[];
}
