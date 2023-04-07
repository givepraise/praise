import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Query,
  Res,
  Request,
  SerializeOptions,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ApiParam, ApiTags } from '@nestjs/swagger';
import { Types } from 'mongoose';
import { ObjectIdPipe } from '../shared/pipes/object-id.pipe';
import { SetSettingDto } from './dto/set-setting.dto';
import { Setting } from './schemas/settings.schema';
import { SettingsService } from './settings.service';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { MongooseClassSerializerInterceptor } from '../shared/interceptors/mongoose-class-serializer.interceptor';
import { Permission } from '../auth/enums/permission.enum';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { EnforceAuthAndPermissions } from '../auth/decorators/enforce-auth-and-permissions.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { ConstantsProvider } from '../constants/constants.provider';
import { Response } from 'express';
import { upploadStorage } from './utils/upload-storage';
import { SettingsFilterDto } from './dto/settings-filter.dto';
import { EventLogService } from '../event-log/event-log.service';
import { EventLogTypeKey } from '../event-log/enums/event-log-type-key';
import { RequestWithAuthContext } from '../auth/interfaces/request-with-auth-context.interface';

@Controller('settings')
@ApiTags('Settings')
@SerializeOptions({
  excludePrefixes: ['__'],
})
@UseInterceptors(MongooseClassSerializerInterceptor(Setting))
@EnforceAuthAndPermissions()
export class SettingsController {
  constructor(
    private readonly settingsService: SettingsService,
    private readonly constants: ConstantsProvider,
    private readonly eventLogService: EventLogService,
  ) {}

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
  async findAll(@Query() filter?: SettingsFilterDto): Promise<Setting[]> {
    return this.settingsService.findAll(filter);
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
  @ApiParam({ name: 'id', type: 'string' })
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
  @ApiParam({ name: 'id', type: 'string' })
  @Permissions(Permission.SettingsManage)
  async set(
    @Param('id', ObjectIdPipe) id: Types.ObjectId,
    @Body() data: SetSettingDto,
    @Request() request: RequestWithAuthContext,
  ): Promise<Setting> {
    const setting = await this.settingsService.setOne(id, data);

    await this.eventLogService.logEventWithAuthContext({
      authContext: request.authContext,
      typeKey: EventLogTypeKey.SETTING,
      description: `Updated global setting "${setting.label}" to "${
        setting.value || ''
      }"`,
    });

    return setting;
  }

  @Patch(':id/upload')
  @ApiOperation({
    summary: 'Upload a file for a setting',
  })
  @ApiResponse({
    status: 200,
    description: 'Updated setting.',
    type: Setting,
  })
  @ApiParam({ name: 'id', type: 'string' })
  @UseInterceptors(
    FileInterceptor('value', {
      storage: upploadStorage,
    }),
  )
  @Permissions(Permission.SettingsManage)
  async setWithUpload(
    @Param('id', ObjectIdPipe) id: Types.ObjectId,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.settingsService.setImageSetting(id, file);
  }

  @Get('uploads/:file')
  @ApiOperation({
    summary: 'Serve an uploaded settings file.',
  })
  @ApiParam({ name: 'file', type: 'string' })
  @Permissions(Permission.SettingsView)
  async serveUpload(
    @Param('file') file: string,
    @Res() res: Response,
  ): Promise<any> {
    res.sendFile(file, { root: this.constants.uploadDirectory });
  }
}
