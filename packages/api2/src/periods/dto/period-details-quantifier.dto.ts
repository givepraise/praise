import { ApiResponseProperty } from '@nestjs/swagger';

export class PeriodDetailsQuantifierDto {
  @ApiResponseProperty()
  _id: string;

  @ApiResponseProperty({ type: 'number', example: 1 })
  finishedCount: number;

  @ApiResponseProperty({ type: 'number', example: 1 })
  praiseCount: number;
}
