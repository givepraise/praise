import { PeriodSetting } from '@/periodsettings/schemas/periodsettings.schema';
import { PeriodDetailsGiverReceiver } from '../interfaces/period-details-giver-receiver.interface';
import { PeriodDetailsQuantifierDto } from './period-details-quantifier.dto';
import { Period } from '../schemas/periods.schema';
import { ApiResponseProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class PeriodDetailsDto extends Period {
  @ApiResponseProperty({
    type: [PeriodDetailsQuantifierDto],
  })
  @Type(() => PeriodDetailsQuantifierDto)
  quantifiers?: PeriodDetailsQuantifierDto[];
  @ApiResponseProperty({
    type: [PeriodDetailsGiverReceiver],
  })
  @Type(() => PeriodDetailsGiverReceiver)
  givers?: PeriodDetailsGiverReceiver[];
  @ApiResponseProperty({
    type: [PeriodDetailsGiverReceiver],
  })
  @Type(() => PeriodDetailsGiverReceiver)
  receivers?: PeriodDetailsGiverReceiver[];
  @ApiResponseProperty({
    type: [PeriodSetting],
  })
  @Type(() => PeriodSetting)
  settings?: PeriodSetting[];
}
