import { QuantifyInputDto } from '@/praise/dto/quantify-input.dto';
import { ApiProperty } from '@nestjs/swagger';
import { Types } from 'mongoose';

export class QuantifyMultipleInputDto {
  @ApiProperty()
  params: QuantifyInputDto;

  @ApiProperty({
    example: [
      '639b178f19296ee0f2d0585d',
      '639b178f19296ee0f2d0585e',
      '639b178f19296ee0f2d0585f',
    ],
  })
  praiseIds: Types.ObjectId[];
}
