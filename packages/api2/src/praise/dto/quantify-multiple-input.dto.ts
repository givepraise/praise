import { QuantifyInputDto } from '@/praise/dto/quantify-input.dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { Types } from 'mongoose';

export class QuantifyMultipleInputDto {
  @ApiProperty({ type: QuantifyInputDto })
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
  praiseIds: Types.ObjectId[];
}
