import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Res,
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
import { MongooseClassSerializerInterceptor } from '@/shared/interceptors/mongoose-class-serializer.interceptor';
import { Permission } from '@/auth/enums/permission.enum';
import { Permissions } from '@/auth/decorators/permissions.decorator';
import { EnforceAuthAndPermissions } from '@/auth/decorators/enforce-auth-and-permissions.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { ConstantsProvider } from '@/constants/constants.provider';
import { Response } from 'express';
import { upploadStorage } from './utils/upload-storage';

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

  @Patch(':id/upload')
  @ApiOperation({
    summary: 'Upload a file for a setting',
  })
  @ApiResponse({
    status: 200,
    description: 'Updated setting.',
    type: Setting,
  })
  @ApiParam({ name: 'id', type: String })
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
  @ApiParam({ name: 'file', type: String })
  @Permissions(Permission.SettingsView)
  async serveUpload(
    @Param('file') file: string,
    @Res() res: Response,
  ): Promise<any> {
    res.sendFile(file, { root: this.constants.uploadDirectory });
  }
}
