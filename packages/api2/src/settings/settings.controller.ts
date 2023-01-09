import {
  Body,
  Controller,
  Get,
  Param,
  Put,
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
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { MongooseClassSerializerInterceptor } from '@/shared/mongoose-class-serializer.interceptor';
import { HydrateSetSettingRequestInterceptor } from './hydrate-set-setting-request.interceptor';

@Controller('settings')
@ApiTags('Settings')
@SerializeOptions({
  excludePrefixes: ['__'],
})
@UseInterceptors(MongooseClassSerializerInterceptor(Setting))
@UseGuards(JwtAuthGuard)
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
  async findOne(
    @Param('id', ObjectIdPipe) id: Types.ObjectId,
  ): Promise<Setting> {
    return this.settingsService.findOneById(id);
  }

  @Put(':id')
  @UseInterceptors(HydrateSetSettingRequestInterceptor)
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
  async set(
    @Param('id', ObjectIdPipe) id: Types.ObjectId,
    @Body() data: SetSettingDto,
  ): Promise<Setting> {
    return this.settingsService.setOne(id, data);
  }
}
