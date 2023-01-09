import { ObjectIdPipe } from '@/shared/pipes/object-id.pipe';
import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  Param,
  ParseBoolPipe,
  Put,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { Request } from 'express';
import { Types } from 'mongoose';
import { SetPeriodSettingDto } from './dto/set-periodsetting.dto';
import { PeriodSettingsService } from './periodsettings.service';
import { PeriodSetting } from './schemas/periodsettings.schema';
import { PermissionsGuard } from '@/auth/guards/permissions.guard';
import { Permission } from '@/auth/enums/permission.enum';
import { Permissions } from '@/auth/decorators/permissions.decorator';
import { AuthGuard } from '@nestjs/passport';

@Controller('period')
@UseInterceptors(ClassSerializerInterceptor)
@UseGuards(PermissionsGuard)
@UseGuards(AuthGuard(['jwt', 'api-key']))
export class PeriodSettingsController {
  constructor(private readonly periodsettingsService: PeriodSettingsService) {}

  @Get(':periodId/settings')
  @ApiOperation({ summary: 'List Period Settings for a given Period ID' })
  @ApiResponse({
    status: 200,
    description: 'All Period Settings',
    type: [PeriodSetting],
  })
  @Permissions(Permission.PeriodSettingsView)
  @ApiParam({ name: 'periodId', type: String })
  async findAll(
    @Param('periodId', ObjectIdPipe) periodId: Types.ObjectId,
  ): Promise<PeriodSetting[]> {
    return this.periodsettingsService.findAll(periodId);
  }

  @Get('/:periodId/settings/:settingId')
  @ApiOperation({ summary: 'Finds a Period Setting for a given Period ID' })
  @ApiResponse({
    status: 200,
    description: 'Period Setting',
    type: PeriodSetting,
  })
  @Permissions(Permission.PeriodSettingsView)
  @ApiParam({ name: 'periodId', type: String })
  @ApiParam({ name: 'settingId', type: String })
  findOne(
    @Param('periodId', ObjectIdPipe) periodId: Types.ObjectId,
    @Param('settingId', ObjectIdPipe) settingId: Types.ObjectId,
  ) {
    return this.periodsettingsService.findOneById(settingId, periodId);
  }

  @Put('/:periodId/settings/:settingId')
  @ApiOperation({ summary: 'Updates a Period Setting for a given Period ID' })
  @ApiResponse({
    status: 200,
    description: 'Updated Period Setting',
    type: PeriodSetting,
  })
  @Permissions(Permission.PeriodSettingsManage)
  @ApiParam({ name: 'periodId', type: String })
  @ApiParam({ name: 'settingId', type: String })
  async set(
    @Param('periodId', ObjectIdPipe) periodId: Types.ObjectId,
    @Param('settingId', ObjectIdPipe) settingId: Types.ObjectId,
    @Body() data: SetPeriodSettingDto,
  ): Promise<PeriodSetting> {
    return this.periodsettingsService.setOne(settingId, periodId, data);
  }
}
