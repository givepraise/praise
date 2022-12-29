import { ObjectIdPipe } from '@/shared/pipes/object-id.pipe';
import { Body, Controller, Get, Param, Patch, Req } from '@nestjs/common';
import { ApiParam } from '@nestjs/swagger';
import { Request } from 'express';
import { Types } from 'mongoose';
import { SetPeriodSettingDto } from './dto/set-periodsetting.dto';
import { PeriodSettingsService } from './periodsettings.service';
import { PeriodSetting } from './schemas/periodsettings.schema';

@Controller('periodsettings')
export class PeriodSettingsController {
  constructor(private readonly periodsettingsService: PeriodSettingsService) {}

  @Get(':periodId/settings/all')
  @ApiParam({ name: 'periodId', type: String })
  async findAll(
    @Param('periodId', ObjectIdPipe) periodId: Types.ObjectId,
  ): Promise<PeriodSetting[]> {
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
  ): Promise<PeriodSetting> {
    return this.periodsettingsService.setOne(settingId, periodId, req, data);
  }
}
