import { UpdateUserRoleInputDto } from './dto/update-user-role-input.dto';
import { UsersService } from './users.service';
import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Query,
  Res,
  SerializeOptions,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { Response } from 'express';
import { Types } from 'mongoose';
import { ObjectIdPipe } from '../shared/pipes/object-id.pipe';
import { User } from './schemas/users.schema';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Permissions } from '@/auth/decorators/permissions.decorator';
import { Permission } from '@/auth/enums/permission.enum';
import { PermissionsGuard } from '@/auth/guards/permissions.guard';
import { EventLogService } from '@/event-log/event-log.service';
import { AuthGuard } from '@nestjs/passport';
import { MongooseClassSerializerInterceptor } from '@/shared/mongoose-class-serializer.interceptor';
import { UserWithStatsDto } from './dto/user-with-stats.dto';
import { UpdateUserRequestDto } from './dto/update-user-request.dto';
import { ExportRequestOptions } from '@/shared/dto/export-request-options.dto';

@Controller('users')
@ApiTags('Users')
@SerializeOptions({
  excludePrefixes: ['__'],
})
@UseInterceptors(MongooseClassSerializerInterceptor(User))
@UseGuards(PermissionsGuard)
@UseGuards(AuthGuard(['jwt', 'api-key']))
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly eventLogService: EventLogService,
  ) {}

  @Get('export')
  @ApiOperation({ summary: 'Export users document to json or csv' })
  @ApiResponse({
    status: 200,
    description: 'Users Export',
    type: [User],
  })
  @Permissions(Permission.UsersExport)
  @ApiParam({ name: 'format', type: String })
  async export(
    @Query() options: ExportRequestOptions,
    @Res() res: Response,
  ): Promise<User[] | Response<string>> {
    const users = await this.usersService.export(options.format);

    if (options.format === 'json') return users as User[];

    res.header('Content-Type', 'text/csv');
    res.attachment('users.csv');
    return res.send(users);
  }

  @Get()
  @Permissions(Permission.UsersFind)
  @ApiResponse({
    status: 200,
    description: 'All users',
    type: [User],
  })
  async findAll(): Promise<User[]> {
    return this.usersService.findAll();
  }

  @Get(':id')
  @Permissions(Permission.UsersFind)
  @ApiResponse({
    status: 200,
    description: 'A single user',
    type: UserWithStatsDto,
  })
  @ApiParam({ name: 'id', type: String })
  async findOne(
    @Param('id', ObjectIdPipe) id: Types.ObjectId,
  ): Promise<UserWithStatsDto> {
    const user = await this.usersService.findOneById(id);
    if (!user) throw new BadRequestException('User not found.');
    return user;
  }

  @Patch(':id')
  @Permissions(Permission.UsersFind)
  @ApiOperation({
    summary: 'Updates a user',
  })
  @ApiResponse({
    status: 200,
    description: 'Updated user',
    type: UpdateUserRequestDto,
  })
  @ApiParam({ name: 'id', type: String })
  async update(
    @Param('id', ObjectIdPipe) id: Types.ObjectId,
    @Body() updateUserInputDto: UpdateUserRequestDto,
  ): Promise<UserWithStatsDto> {
    return this.usersService.update(id, updateUserInputDto);
  }

  @Patch(':id/addRole')
  @Permissions(Permission.UsersManageRoles)
  @ApiResponse({
    status: 200,
    description: 'The updated user',
    type: UserWithStatsDto,
  })
  @ApiParam({ name: 'id', type: String })
  async addRole(
    @Param('id', ObjectIdPipe) id: Types.ObjectId,
    @Body() roleChange: UpdateUserRoleInputDto,
  ): Promise<UserWithStatsDto> {
    return this.usersService.addRole(id, roleChange);
  }

  @Patch(':id/removeRole')
  @Permissions(Permission.UsersManageRoles)
  @ApiResponse({
    status: 200,
    description: 'The updated user',
    type: UserWithStatsDto,
  })
  @ApiParam({ name: 'id', type: String })
  async removeRole(
    @Param('id', ObjectIdPipe) id: Types.ObjectId,
    @Body() roleChange: UpdateUserRoleInputDto,
  ): Promise<UserWithStatsDto> {
    return this.usersService.removeRole(id, roleChange);
  }
}
