import { ObjectIdPipe } from '@/shared/pipes/object-id.pipe';
import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  Param,
  Patch,
  SerializeOptions,
  UseInterceptors,
} from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Types } from 'mongoose';
import { SetPeriodSettingDto } from './dto/set-periodsetting.dto';
import { PeriodSettingsService } from './periodsettings.service';
import { PeriodSetting } from './schemas/periodsettings.schema';
import { Permission } from '@/auth/enums/permission.enum';
import { Permissions } from '@/auth/decorators/permissions.decorator';
import { ValueRealizedInterceptor } from './interceptors/value-realized.interceptor';
import { EnforceAuthAndPermissions } from '@/auth/decorators/enforce-auth-and-permissions.decorator';

@Controller('periods')
@ApiTags('Periods')
@UseInterceptors(ClassSerializerInterceptor)
@UseInterceptors(ValueRealizedInterceptor)
@SerializeOptions({
  excludePrefixes: ['__'],
})
@EnforceAuthAndPermissions()
export class PeriodSettingsController {
  constructor(private readonly periodsettingsService: PeriodSettingsService) {}

  @Get(':periodId/settings')
  @ApiOperation({ summary: 'List all period settings.' })
  @ApiResponse({
    status: 200,
    description: 'All period settings',
    type: [PeriodSetting],
  })
  @Permissions(Permission.PeriodSettingsView)
  @ApiParam({ name: 'periodId', type: 'string' })
  async findAll(
    @Param('periodId', ObjectIdPipe) periodId: Types.ObjectId,
  ): Promise<PeriodSetting[]> {
    return this.periodsettingsService.findAll(periodId);
  }

  @Get('/:periodId/settings/:settingId')
  @ApiOperation({ summary: 'Get a period setting.' })
  @ApiResponse({
    status: 200,
    description: 'Period setting',
    type: PeriodSetting,
  })
  @Permissions(Permission.PeriodSettingsView)
  @ApiParam({ name: 'periodId', type: 'string' })
  @ApiParam({ name: 'settingId', type: 'string' })
  findOne(
    @Param('periodId', ObjectIdPipe) periodId: Types.ObjectId,
    @Param('settingId', ObjectIdPipe) settingId: Types.ObjectId,
  ) {
    return this.periodsettingsService.findOneBySettingIdAndPeriodId(
      settingId,
      periodId,
    );
  }

  @Patch('/:periodId/settings/:settingId')
  @ApiOperation({ summary: 'Set value for a period setting.' })
  @ApiResponse({
    status: 200,
    description: 'Updated period setting',
    type: PeriodSetting,
  })
  @Permissions(Permission.PeriodSettingsManage)
  @ApiParam({ name: 'periodId', type: 'string' })
  @ApiParam({ name: 'settingId', type: 'string' })
  async set(
    @Param('periodId', ObjectIdPipe) periodId: Types.ObjectId,
    @Param('settingId', ObjectIdPipe) settingId: Types.ObjectId,
    @Body() data: SetPeriodSettingDto,
  ): Promise<PeriodSetting> {
    return this.periodsettingsService.setOne(settingId, periodId, data);
  }
}
