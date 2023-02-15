import { ApiResponseProperty } from '@nestjs/swagger';
import { Praise } from '../schemas/praise.schema';

export class PraiseCreateResponseDto {
  @ApiResponseProperty({
    type: [Praise],
  })
  praiseItems: Praise[];

  @ApiResponseProperty({
    type: [String],
  })
  messages: string[];
}
