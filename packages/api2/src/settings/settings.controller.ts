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
import { ApiParam } from '@nestjs/swagger';
import { Types } from 'mongoose';
import { ObjectIdPipe } from '../shared/pipes/object-id.pipe';
import { ExportTransformer } from '@/shared/types.shared';
import { SetSettingDto } from './dto/set-setting.dto';
import { Setting } from './schemas/settings.schema';
import { SettingsService } from './settings.service';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { MongooseClassSerializerInterceptor } from '@/shared/mongoose-class-serializer.interceptor';

@Controller('settings')
@SerializeOptions({
  excludePrefixes: ['__'],
})
@UseInterceptors(MongooseClassSerializerInterceptor(Setting))
@UseGuards(JwtAuthGuard)
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  async findAll(): Promise<Setting[]> {
    return this.settingsService.findAll();
  }

  @Get(':id')
  @ApiParam({ name: 'id', type: String })
  async findOne(
    @Param('id', ObjectIdPipe) id: Types.ObjectId,
  ): Promise<Setting> {
    return this.settingsService.findOneById(id);
  }

  @Patch(':id/set')
  @ApiParam({ name: 'id', type: String })
  async set(
    @Param('id', ObjectIdPipe) id: Types.ObjectId,
    @Body() data: SetSettingDto,
  ): Promise<Setting> {
    return this.settingsService.setOne(id, data);
  }

  @Get('/customExportTransformer')
  async customExportTransformer(): Promise<ExportTransformer> {
    return this.settingsService.findCustomExportTransformer();
  }
}
