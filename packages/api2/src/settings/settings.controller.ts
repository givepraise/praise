import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  SerializeOptions,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiParam, ApiTags } from '@nestjs/swagger';
import { Types } from 'mongoose';
import { ObjectIdPipe } from '../shared/pipes/object-id.pipe';
import { SetSettingDto } from './dto/set-setting.dto';
import { Setting } from './schemas/settings.schema';
import { SettingsService } from './settings.service';
import { ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { MongooseClassSerializerInterceptor } from '@/shared/mongoose-class-serializer.interceptor';
import { AuthGuard } from '@nestjs/passport';
import { Permission } from '@/auth/enums/permission.enum';
import { Permissions } from '@/auth/decorators/permissions.decorator';
import { PermissionsGuard } from '@/auth/guards/permissions.guard';

@Controller('settings')
@ApiTags('Settings')
@SerializeOptions({
  excludePrefixes: ['__'],
})
@UseInterceptors(MongooseClassSerializerInterceptor(Setting))
@UseGuards(PermissionsGuard)
@UseGuards(AuthGuard(['jwt', 'api-key']))
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  @ApiOperation({
    summary: 'Returns the general settings not belonging to a period',
  })
  @ApiResponse({
    status: 200,
    description: 'Settings returned succesfully',
    type: [Setting],
  })
  @Permissions(Permission.SettingsView)
  async findAll(): Promise<Setting[]> {
    return this.settingsService.findAll();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Returns an specified setting by id',
  })
  @ApiResponse({
    status: 200,
    description: 'Setting returned succesfully',
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
    summary: 'Returns an updated setting',
  })
  @ApiBody({
    type: SetSettingDto,
    description: 'A request containing the user identityEthAddress',
  })
  @ApiResponse({
    status: 200,
    description: 'Setting returned succesfully',
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
