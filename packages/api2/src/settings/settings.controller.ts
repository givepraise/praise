import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  SerializeOptions,
  UseInterceptors,
} from '@nestjs/common';
import { ApiParam, ApiTags } from '@nestjs/swagger';
import { Types } from 'mongoose';
import { ObjectIdPipe } from '../shared/pipes/object-id.pipe';
import { SetSettingDto } from './dto/set-setting.dto';
import { Setting } from './schemas/settings.schema';
import { SettingsService } from './settings.service';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { MongooseClassSerializerInterceptor } from '@/shared/interceptors/mongoose-class-serializer.interceptor';
import { Permission } from '@/auth/enums/permission.enum';
import { Permissions } from '@/auth/decorators/permissions.decorator';
import { EnforceAuthAndPermissions } from '@/auth/decorators/enforce-auth-and-permissions.decorator';

@Controller('settings')
@ApiTags('Settings')
@SerializeOptions({
  excludePrefixes: ['__'],
})
@UseInterceptors(MongooseClassSerializerInterceptor(Setting))
@EnforceAuthAndPermissions()
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  @ApiOperation({
    summary: 'List all settings.',
  })
  @ApiResponse({
    status: 200,
    description: 'All settings.',
    type: [Setting],
  })
  @Permissions(Permission.SettingsView)
  async findAll(): Promise<Setting[]> {
    return this.settingsService.findAll();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get a setting.',
  })
  @ApiResponse({
    status: 200,
    description: 'Setting.',
    type: Setting,
  })
  @ApiParam({ name: 'id', type: String })
  @Permissions(Permission.SettingsView)
  async findOne(
    @Param('id', ObjectIdPipe) id: Types.ObjectId,
  ): Promise<Setting> {
    return this.settingsService.findOneById(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Set a value for a setting.',
  })
  @ApiResponse({
    status: 200,
    description: 'Updated setting.',
    type: Setting,
  })
  @ApiParam({ name: 'id', type: String })
  @Permissions(Permission.SettingsManage)
  async set(
    @Param('id', ObjectIdPipe) id: Types.ObjectId,
    @Body() data: SetSettingDto,
  ): Promise<Setting> {
    return this.settingsService.setOne(id, data);
  }
}
