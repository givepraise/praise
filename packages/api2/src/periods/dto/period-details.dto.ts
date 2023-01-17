import { PeriodSetting } from '@/periodsettings/schemas/periodsettings.schema';
import { PeriodDetailsGiverReceiver } from '../interfaces/period-details-giver-receiver.interface';
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
  givers?: PeriodDetailsGiverReceiver[];
  @ApiResponseProperty({
    type: [PeriodDetailsGiverReceiverDto],
  })
  @Type(() => PeriodDetailsGiverReceiverDto)
  receivers?: PeriodDetailsGiverReceiver[];
  @ApiResponseProperty({
    type: [PeriodSetting],
  })
  @Type(() => PeriodSetting)
  settings?: PeriodSetting[];
}
