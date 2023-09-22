import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  SerializeOptions,
  UseInterceptors,
} from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CommunityService } from './community.service';
import { Permission } from '../auth/enums/permission.enum';
import { Community } from './schemas/community.schema';
import { MongooseClassSerializerInterceptor } from '../shared/interceptors/mongoose-class-serializer.interceptor';
import { ObjectIdPipe } from '../shared/pipes/object-id.pipe';
import { CommunityFindAllResponseDto } from './dto/find-all-response.dto';
import { ObjectId, Types } from 'mongoose';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { CreateCommunityInputDto } from './dto/create-community-input.dto';
import { UpdateCommunityInputDto } from './dto/update-community-input.dto';
import { EnforceAuthAndPermissions } from '../auth/decorators/enforce-auth-and-permissions.decorator';
import { LinkDiscordBotDto } from './dto/link-discord-bot.dto';
import { errorMessages } from '../shared/exceptions/error-messages';
import { ApiException } from '../shared/exceptions/api-exception';
import { IsNameAvailableResponseDto } from './dto/is-name-available-response-dto';
import { IsNameAvailableRequestDto } from './dto/is-name-available-request-dto';
import { EventLogService } from '../event-log/event-log.service';
import { EventLogTypeKey } from '../event-log/enums/event-log-type-key';
import { CommunityFindAllQueryDto } from './dto/find-all-query.dto';
import { Public } from '../shared/decorators/public.decorator';
import { Request } from 'express';

@Controller('communities')
@ApiTags('Communities')
@SerializeOptions({
  excludePrefixes: ['__'],
})
@EnforceAuthAndPermissions()
export class CommunityController {
  constructor(
    private readonly communityService: CommunityService,
    private readonly eventLogService: EventLogService,
  ) {}

  @Post('/')
  @ApiOperation({ summary: 'Create a new community' })
  @ApiResponse({
    status: 200,
    description: 'Community',
    type: Community,
  })
  @Permissions(Permission.CommunitiesCreate)
  @UseInterceptors(MongooseClassSerializerInterceptor(Community))
  async create(
    @Body() createCommunityInputDto: CreateCommunityInputDto,
  ): Promise<Community> {
    return this.communityService.create(createCommunityInputDto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update community' })
  @ApiResponse({
    status: 200,
    description: 'Community',
    type: Community,
  })
  @Permissions(Permission.CommunitiesUpdate)
  @UseInterceptors(MongooseClassSerializerInterceptor(Community))
  async update(
    @Param('id', ObjectIdPipe) id: Types.ObjectId,
    @Body() updateCommunityInputDto: UpdateCommunityInputDto,
  ): Promise<Community> {
    return this.communityService.update(id, updateCommunityInputDto);
  }

  @Get()
  @Permissions(Permission.CommunitiesView)
  @ApiResponse({
    status: 200,
    description: 'All communities',
    type: CommunityFindAllResponseDto,
  })
  @UseInterceptors(MongooseClassSerializerInterceptor(Community))
  async findAll(
    @Query() options: CommunityFindAllQueryDto,
  ): Promise<CommunityFindAllResponseDto> {
    return this.communityService.findAllPaginated(options);
  }

  @Get('/isNameAvailable')
  @ApiResponse({
    status: 200,
    description: 'Checking whether the community name is available',
    type: IsNameAvailableResponseDto,
  })
  async isNameAvailable(
    @Query() options: IsNameAvailableRequestDto,
  ): Promise<IsNameAvailableResponseDto> {
    return await this.communityService.isCommunityNameAvailable(options.name);
  }

  @Get('/current')
  @Public()
  @ApiResponse({
    status: 200,
    description: 'Returns the current community, based on hostname',
    type: Community,
  })
  @UseInterceptors(MongooseClassSerializerInterceptor(Community))
  async current(@Req() req: Request): Promise<Community> {
    return this.communityService.findOne({ hostname: req.hostname });
  }

  @Get(':id')
  @Permissions(Permission.CommunitiesView)
  @ApiResponse({
    status: 200,
    description: 'A single Community',
    type: Community,
  })
  @UseInterceptors(MongooseClassSerializerInterceptor(Community))
  @ApiParam({ name: 'id', type: String })
  async findOne(@Param('id', ObjectIdPipe) id: ObjectId): Promise<Community> {
    const community = await this.communityService.findOne(id);
    if (!community) throw new ApiException(errorMessages.COMMUNITY_NOT_FOUND);
    return community;
  }

  @Patch(':id/discord/link')
  @ApiOperation({ summary: 'Link discord to community' })
  @ApiResponse({
    status: 200,
    description: 'Community',
    type: Community,
  })
  @Permissions(Permission.CommunitiesUpdate)
  @UseInterceptors(MongooseClassSerializerInterceptor(Community))
  async linkDiscord(
    @Param('id', ObjectIdPipe) id: Types.ObjectId,
    @Body() linkDiscordBotDto: LinkDiscordBotDto,
  ): Promise<Community> {
    const community = await this.communityService.linkDiscord(
      id,
      linkDiscordBotDto,
    );

    await this.eventLogService.logEvent({
      typeKey: EventLogTypeKey.COMMUNITY,
      description: `Community "${community.name}" linked to discord bot`,
    });

    return community;
  }

  // TODO Implement webservice activate/deactivate/update  communities for admin panel usage in future
}
