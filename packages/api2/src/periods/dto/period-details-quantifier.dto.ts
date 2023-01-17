import { ExposeId } from '@/shared/expose-id.decorator';
import { ApiResponseProperty } from '@nestjs/swagger';
import { Types } from 'mongoose';

export class PeriodDetailsQuantifierDto {
  @ApiResponseProperty()
  @ExposeId()
  _id: Types.ObjectId;

  @ApiResponseProperty({ type: 'number', example: 1 })
  finishedCount: number;

  @ApiResponseProperty({ type: 'number', example: 1 })
  praiseCount: number;
}
