import * as fs from 'fs';
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
  StreamableFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { Response } from 'express';
import { Types } from 'mongoose';
import { ObjectIdPipe } from '../shared/pipes/object-id.pipe';
import { User } from './schemas/users.schema';
import {
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
  ApiProduces,
} from '@nestjs/swagger';
import { Permissions } from '@/auth/decorators/permissions.decorator';
import { Permission } from '@/auth/enums/permission.enum';
import { PermissionsGuard } from '@/auth/guards/permissions.guard';
import { EventLogService } from '@/event-log/event-log.service';
import { AuthGuard } from '@nestjs/passport';
import { MongooseClassSerializerInterceptor } from '@/shared/interceptors/mongoose-class-serializer.interceptor';
import { UserWithStatsDto } from './dto/user-with-stats.dto';
import { UpdateUserRequestDto } from './dto/update-user-request.dto';
import { ExportInputFormatOnlyDto } from '@/shared/dto/export-input-format-only';
import { allExportsDirPath } from '@/shared/fs.shared';

@Controller('users')
@ApiTags('Users')
@SerializeOptions({
  excludePrefixes: ['__'],
})
// @UseGuards(PermissionsGuard)
// @UseGuards(AuthGuard(['jwt', 'api-key']))
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly eventLogService: EventLogService,
  ) {}

  @Get('/export')
  @ApiOperation({ summary: 'Export users document to json or csv' })
  @ApiOkResponse({
    schema: {
      type: 'string',
      format: 'binary',
    },
  })
  @ApiProduces('application/octet-stream')
  @ApiProduces('application/json')
  @Permissions(Permission.UsersExport)
  async export(
    @Query() options: ExportInputFormatOnlyDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<StreamableFile> {
    const { format } = options;
    const exportFolderPath = `${allExportsDirPath}/users`;
    // The export id is the last inserted id in the collection
    const exportId = await this.usersService.getExportDirName();
    const exportFilePath = `${exportFolderPath}/${exportId}/users.${format}`;

    // Cached export don't exist, clear cache and generate new export
    if (!fs.existsSync(exportFilePath)) {
      if (fs.existsSync(exportFolderPath)) {
        fs.rmSync(exportFolderPath, { recursive: true, force: true });
      }

      // Generate new export files
      await this.usersService.generateAllExports();
    }

    const file = fs.createReadStream(exportFilePath);
    res.set({
      'Content-Type':
        format === 'json' ? 'application/json' : 'application/octet-stream',
      'Content-Disposition': `attachment; filename="users.${format}"`,
    });
    return new StreamableFile(file);
  }

  @Get()
  @Permissions(Permission.UsersFind)
  @ApiResponse({
    status: 200,
    description: 'All users',
    type: [User],
  })
  @UseInterceptors(MongooseClassSerializerInterceptor(User))
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
  @UseInterceptors(MongooseClassSerializerInterceptor(UserWithStatsDto))
  @ApiParam({ name: 'id', type: String })
  async findOne(
    @Param('id', ObjectIdPipe) id: Types.ObjectId,
  ): Promise<UserWithStatsDto> {
    const user = await this.usersService.findOneById(id);
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

  @Patch(':id/addRole')
  @Permissions(Permission.UsersManageRoles)
  @ApiResponse({
    status: 200,
    description: 'The updated user',
    type: UserWithStatsDto,
  })
  @UseInterceptors(MongooseClassSerializerInterceptor(UserWithStatsDto))
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
  @UseInterceptors(MongooseClassSerializerInterceptor(UserWithStatsDto))
  @ApiParam({ name: 'id', type: String })
  async removeRole(
    @Param('id', ObjectIdPipe) id: Types.ObjectId,
    @Body() roleChange: UpdateUserRoleInputDto,
  ): Promise<UserWithStatsDto> {
    return this.usersService.removeRole(id, roleChange);
  }
}
