import {
  BadRequestException, Body,
  Controller,
  Get,
  Param, Patch, Post, Query,
  SerializeOptions,
  UseGuards,
  UseInterceptors
} from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { PermissionsGuard } from '@/auth/guards/permissions.guard';
import { AuthGuard } from '@nestjs/passport';
import { CommunityService } from './community.service';
import { Permission } from '@/auth/enums/permission.enum';
import { Community } from './schemas/community.schema';
import { MongooseClassSerializerInterceptor } from '@/shared/interceptors/mongoose-class-serializer.interceptor';
import { UserWithStatsDto } from '@/users/dto/user-with-stats.dto';
import { ObjectIdPipe } from '@/shared/pipes/object-id.pipe';
import { CommunityPaginatedResponseDto } from './dto/community-pagination-model.dto';
import { PaginatedQueryDto } from '@/shared/dto/pagination-query.dto';
import { ObjectId, Schema, Types } from 'mongoose';
import { PeriodDetailsDto } from '@/periods/dto/period-details.dto';
import { Permissions } from '@/auth/decorators/permissions.decorator';
import { CreateCommunityInputDto } from './dto/create-community-input.dto';
import { UpdateCommunityInputDto } from './dto/update-community-input.dto';
import { EnforceAuthAndPermissions } from '@/auth/decorators/enforce-auth-and-permissions.decorator';

@Controller('communities')
@ApiTags('Communities')
@SerializeOptions({
  excludePrefixes: ['__']
})
@EnforceAuthAndPermissions()
export class CommunityController {
  constructor(
    private readonly communityService: CommunityService
  ) {
  }


  @Post('/')
  @ApiOperation({ summary: 'Create a new community' })
  @ApiResponse({
    status: 200,
    description: 'Community',
    type: CreateCommunityInputDto
  })
  @Permissions(Permission.CommunitiesCreate)
  @UseInterceptors(MongooseClassSerializerInterceptor(Community))
  async create(
    @Body() createCommunityInputDto: CreateCommunityInputDto
  ): Promise<Community> {
    return this.communityService.create(
      createCommunityInputDto);
  }


  @Patch(':id')
  @ApiOperation({ summary: 'Update community' })
  @ApiResponse({
    status: 200,
    description: 'Community',
    type: CreateCommunityInputDto
  })
  @Permissions(Permission.CommunitiesUpdate)
  @UseInterceptors(MongooseClassSerializerInterceptor(Community))
  async update(
    @Param('id', ObjectIdPipe) id: Types.ObjectId,
    @Body() updateCommunityInputDto: UpdateCommunityInputDto
  ): Promise<Community> {
    return this.communityService.update(
      id,
      updateCommunityInputDto);
  }


  @Get()
  @Permissions(Permission.CommunitiesView)
  @ApiResponse({
    status: 200,
    description: 'All communities',
    type: PaginatedQueryDto
  })
  @UseInterceptors(MongooseClassSerializerInterceptor(Community))
  async findAll(@Query() options: PaginatedQueryDto): Promise<CommunityPaginatedResponseDto> {
    return this.communityService.findAllPaginated(options);
  }

  @Get(':id')
  @Permissions(Permission.CommunitiesView)
  @ApiResponse({
    status: 200,
    description: 'A single Community',
    type: Community
  })
  @UseInterceptors(MongooseClassSerializerInterceptor(Community))
  @ApiParam({ name: 'id', type: String })
  async findOne(
    @Param('id', ObjectIdPipe) id: ObjectId
  ): Promise<Community> {
    const community = await this.communityService.findOne(id);
    if (!community) throw new BadRequestException('Community not found.');
    return community;
  }

  // TODO Implement webservice activate/deactivate/update  communities for admin panel usage in future

}
