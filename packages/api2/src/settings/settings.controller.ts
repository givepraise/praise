import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  Param,
  Patch,
  Req,
  SerializeOptions,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiParam } from '@nestjs/swagger';
import { Request } from 'express';
import { Types } from 'mongoose';
import { ObjectIdPipe } from '../objectId.pipe';
import { ExportTransformer } from 'src/shared/types.shared';
import { SetSettingDto } from './dto/set-setting.dto';
import { Settings } from './schemas/settings.schema';
import { SettingsService } from './settings.service';
import { JwtAuthGuard } from 'src/authentication/jwt-auth.guard';

@Controller('settings')
@SerializeOptions({
  excludePrefixes: ['__'],
})
@UseInterceptors(ClassSerializerInterceptor)
@UseGuards(JwtAuthGuard)
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  async findAll(): Promise<Settings[]> {
    return this.settingsService.findAll();
  }

  @Get(':id')
  @ApiParam({ name: 'id', type: String })
  async findOne(
    @Param('id', ObjectIdPipe) id: Types.ObjectId,
  ): Promise<Settings> {
    return this.settingsService.findOneById(id);
  }

  @Patch(':id/set')
  @ApiParam({ name: 'id', type: String })
  async set(
    @Param('id', ObjectIdPipe) id: Types.ObjectId,
    @Body() data: SetSettingDto,
    @Req() req: Request,
  ): Promise<Settings> {
    return this.settingsService.setOne(id, req, data);
  }

  @Get('/customExportTransformer')
  async customExportTransformer(): Promise<ExportTransformer> {
    return this.settingsService.findCustomExportTransformer();
  }
}
