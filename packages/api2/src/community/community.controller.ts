import {
  BadRequestException, Body,
  Controller,
  Get,
  Param, Patch,
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
import { Schema } from 'mongoose';
import Types = module
import { UpdateUserRequestDto } from '@/users/dto/update-user-request.dto';


@Controller('communities')
@ApiTags('Communities')
@SerializeOptions({
  excludePrefixes: ['__'],
})
@UseGuards(PermissionsGuard)
@UseGuards(AuthGuard(['jwt', 'api-key']))
export class CommunityController {
  constructor(
    private readonly communityService: CommunityService,
  ) {}

  @Get()
  @Permissions(Permission.CommunitiesFind)
  @ApiResponse({
    status: 200,
    description: 'All communities',
    type: [Community],
  })
  @UseInterceptors(MongooseClassSerializerInterceptor(Community))
  async findAll(): Promise<Community[]> {
    return this.communityService.findAllPaginated();
  }

  @Get(':id')
  @Permissions(Permission.CommunitiesFind)
  @ApiResponse({
    status: 200,
    description: 'A single Community',
    type: Community,
  })
  @UseInterceptors(MongooseClassSerializerInterceptor(UserWithStatsDto))
  @ApiParam({ name: 'id', type: String })
  async findOne(
    @Param('id', ObjectIdPipe) id: Types.ObjectId,
  ): Promise<Community> {
    const user = await this.communityService.(id);
    if (!user) throw new BadRequestException('User not found.');
    return user;
  }

  @Patch(':id')
  @Permissions(Permission.UserProfileUpdate)
  @ApiOperation({
    summary: 'Updates a user',
  })
  @ApiResponse({
    status: 200,
    description: 'Updated user',
    type: UpdateUserRequestDto,
  })
  @UseInterceptors(MongooseClassSerializerInterceptor(UserWithStatsDto))
  @ApiParam({ name: 'id', type: String })
  async update(
    @Param('id', ObjectIdPipe) id: Types.ObjectId,
    @Body() updateUserInputDto: UpdateUserRequestDto,
  ): Promise<UserWithStatsDto> {
    return this.usersService.update(id, updateUserInputDto);
  }

}
