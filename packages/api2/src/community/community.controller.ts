import {
  BadRequestException, Body,
  Controller,
  Get,
  Param, Patch, Post, Put, Query,
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
import { CreatePeriodInputDto } from '@/periods/dto/create-period-input.dto';
import { CreateCommunityInputDto } from './dto/create-community-input.dto';
import { RequestWithAuthContext } from '@/auth/interfaces/request-with-auth-context.interface';
import { RequestContext } from 'nestjs-request-context';
import { UpdateCommunityByAdminInputDto } from './dto/update-community-by-admin-input.dto';


@Controller('communities')
@ApiTags('Communities')
@SerializeOptions({
  excludePrefixes: ['__']
})
@UseGuards(PermissionsGuard)
@UseGuards(AuthGuard(['jwt', 'api-key']))
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
  @UseInterceptors(MongooseClassSerializerInterceptor(PeriodDetailsDto))
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
  @UseInterceptors(MongooseClassSerializerInterceptor(PeriodDetailsDto))
  async update(
    @Param('id', ObjectIdPipe) id: Types.ObjectId,
    @Body() updateCommunityInputDto: UpdateCommunityByAdminInputDto
  ): Promise<Community> {
    return this.communityService.update(
      id,
      updateCommunityInputDto);
  }


  @Get()
  @Permissions(Permission.CommunitiesFind)
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
  @Permissions(Permission.CommunitiesFind)
  @ApiResponse({
    status: 200,
    description: 'A single Community',
    type: Community
  })
  @UseInterceptors(MongooseClassSerializerInterceptor(UserWithStatsDto))
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
