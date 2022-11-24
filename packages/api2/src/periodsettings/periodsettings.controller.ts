import { Body, Controller, Get, Param, Patch, Req } from '@nestjs/common';
import { ApiParam } from '@nestjs/swagger';
import { Request } from 'express';
import { Types } from 'mongoose';
import { ObjectIdPipe } from 'src/objectId.pipe';
import { SetPeriodSettingDto } from './dto/set-periodsetting.dto';
import { PeriodSettingsService } from './periodsettings.service';
import { PeriodSettings } from './schemas/periodsettings.schema';

@Controller('periodsettings')
export class PeriodsettingsController {
  constructor(private readonly periodsettingsService: PeriodSettingsService) {}

  @Get(':periodId/settings/all')
  @ApiParam({ name: 'periodId', type: String })
  async findAll(
    @Param('periodId', ObjectIdPipe) periodId: Types.ObjectId,
  ): Promise<PeriodSettings[]> {
    return this.periodsettingsService.findAll(periodId);
  }

  @Get('/:periodId/settings/:settingId')
  @ApiParam({ name: 'periodId', type: String })
  @ApiParam({ name: 'settingId', type: String })
  findOne(
    @Param('periodId', ObjectIdPipe) periodId: Types.ObjectId,
    @Param('settingId', ObjectIdPipe) settingId: Types.ObjectId,
  ) {
    return this.periodsettingsService.findOneById(settingId, periodId);
  }

  @Patch('/:periodId/settings/:settingId/set')
  @ApiParam({ name: 'periodId', type: String })
  @ApiParam({ name: 'settingId', type: String })
  async set(
    @Param('periodId', ObjectIdPipe) periodId: Types.ObjectId,
    @Param('settingId', ObjectIdPipe) settingId: Types.ObjectId,
    @Body() data: SetPeriodSettingDto,
    @Req() req: Request,
  ): Promise<PeriodSettings> {
    return this.periodsettingsService.setOne(settingId, periodId, req, data);
  }
}
