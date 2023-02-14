import { ApiResponseProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { Praise } from '../schemas/praise.schema';

export class PraiseCreateResponseDto {
  @ApiResponseProperty({
    type: [Praise],
  })
  @Type(() => Praise)
  praiseItems: Praise[];

  @ApiResponseProperty({
    type: [String],
  })
  messages: string[];
}
