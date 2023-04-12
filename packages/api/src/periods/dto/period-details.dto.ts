import { PeriodDetailsQuantifierDto } from './period-details-quantifier.dto';
import { Period } from '../schemas/periods.schema';
import { ApiResponseProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { PeriodDetailsGiverReceiverDto } from './period-details-giver-receiver.dto';

export class PeriodDetailsDto extends Period {
  @ApiResponseProperty({
    type: [PeriodDetailsQuantifierDto],
  })
  @Type(() => PeriodDetailsQuantifierDto)
  quantifiers?: PeriodDetailsQuantifierDto[];

  @ApiResponseProperty({
    type: [PeriodDetailsGiverReceiverDto],
  })
  @Type(() => PeriodDetailsGiverReceiverDto)
  givers?: PeriodDetailsGiverReceiverDto[];

  @ApiResponseProperty({
    type: [PeriodDetailsGiverReceiverDto],
  })
  @Type(() => PeriodDetailsGiverReceiverDto)
  receivers?: PeriodDetailsGiverReceiverDto[];

  @ApiResponseProperty({
    example: 543,
    type: 'number',
  })
  numberOfPraise: number;

  // @ApiResponseProperty({
  //   type: [PeriodSetting],
  // })
  // @Type(() => PeriodSetting)
  // settings?: PeriodSetting[];
}
