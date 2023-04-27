import * as fs from 'fs';
import {
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
  ApiProduces,
} from '@nestjs/swagger';
import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Request,
  Res,
  SerializeOptions,
  UseInterceptors,
} from '@nestjs/common';
import { Response } from 'express';
import { Types } from 'mongoose';
import { User, UsersExportSqlSchema } from './schemas/users.schema';
import { UsersService } from './users.service';
import { ObjectIdPipe } from '../shared/pipes/object-id.pipe';
import { UpdateUserRoleInputDto } from './dto/update-user-role-input.dto';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { Permission } from '../auth/enums/permission.enum';
import { MongooseClassSerializerInterceptor } from '../shared/interceptors/mongoose-class-serializer.interceptor';
import { UserWithStatsDto } from './dto/user-with-stats.dto';
import { UpdateUserRequestDto } from './dto/update-user-request.dto';
import { exportTmpFilePath } from '../shared/fs.shared';
import { generateParquetExport } from '../shared/export.shared';
import { EnforceAuthAndPermissions } from '../auth/decorators/enforce-auth-and-permissions.decorator';
import { ApiException } from '../shared/exceptions/api-exception';
import { errorMessages } from '../shared/exceptions/error-messages';
import { EventLogService } from '../event-log/event-log.service';
import { RequestWithAuthContext } from '../auth/interfaces/request-with-auth-context.interface';
import { EventLogTypeKey } from '../event-log/enums/event-log-type-key';
import { Transform } from '@json2csv/node';
import * as JSONStream from 'JSONStream';
import { Public } from '../shared/decorators/public.decorator';

const exportIncludeFields = [
  '_id',
  'username',
  'identityEthAddress',
  'rewardsEthAddress',
  'roles',
  'createdAt',
  'updatedAt',
];

@Controller('users')
@ApiTags('Users')
@SerializeOptions({
  excludePrefixes: ['__'],
})
@EnforceAuthAndPermissions()
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly eventLogService: EventLogService,
  ) {}

  @Get('export/json')
  @ApiOperation({ summary: 'Export users document to json' })
  @ApiOkResponse({
    schema: {
      type: 'string',
      format: 'binary',
    },
  })
  @ApiProduces('application/json')
  @Public()
  @Permissions(Permission.UsersExport)
  async exportJson(@Res() res: Response) {
    res.set({
      'Content-Type': 'application/json',
      'Content-Disposition': `attachment; filename="users.json"`,
    });

    // Create a cursor to the users collection
    const usersCursor = await this.usersService.exportCursor(
      exportIncludeFields,
    );

    // Close the cursor when the response is closed
    res.on('close', () => {
      usersCursor.close();
    });

    usersCursor.pipe(JSONStream.stringify()).pipe(res);
  }

  @Get('export/csv')
  @ApiOperation({ summary: 'Export users document to csv' })
  @ApiOkResponse({
    schema: {
      type: 'string',
      format: 'binary',
    },
  })
  @ApiProduces('text/csv')
  @Public()
  @Permissions(Permission.UsersExport)
  async exportCsv(@Res() res: Response) {
    res.set({
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="users.csv"`,
    });

    // Create a cursor to the users collection
    const usersCursor = await this.usersService.exportCursor(
      exportIncludeFields,
    );

    // Create a transformer to convert the JSON data to CSV
    const csvTransformer = new Transform(
      { fields: exportIncludeFields },
      { objectMode: true },
    );

    // Close the cursor when the response is closed
    res.on('close', () => {
      usersCursor.close();
    });

    usersCursor.pipe(csvTransformer).pipe(res);
  }

  @Get('export/parquet')
  @Public()
  @ApiOperation({ summary: 'Export users document to parquet' })
  @ApiOkResponse({
    schema: {
      type: 'string',
      format: 'binary',
    },
  })
  @ApiProduces('application/octet-stream')
  @Permissions(Permission.UsersExport)
  async exportParquet(@Res() res: Response) {
    res.set({
      'Content-Type': 'application/octet-stream',
      'Content-Disposition': `attachment; filename="users.parquet"`,
    });

    // Tmp file paths
    const tmpCsvPath = exportTmpFilePath('users.csv');
    const tmpParquetPath = exportTmpFilePath('users.parquet');

    // Create a cursor to the users collection
    const usersCursor = await this.usersService.exportCursor(
      exportIncludeFields,
    );

    // Create a writable stream to the temporary csv file
    const writableStream = fs.createWriteStream(tmpCsvPath);

    // Create a transformer to convert the JSON data to CSV
    const csvTransformer = new Transform(
      { fields: exportIncludeFields },
      { objectMode: true },
    );

    // Pipe the CSV data to the temporary file
    usersCursor.pipe(csvTransformer).pipe(writableStream);

    // When the CSV data is finished, convert it to Parquet and send it as a response
    writableStream.on('finish', async () => {
      // Convert the CSV file to Parquet
      await generateParquetExport(
        'users',
        UsersExportSqlSchema,
        tmpCsvPath,
        tmpParquetPath,
      );

      // Read temporary parquet file and send it as a response
      const readableStream = fs.createReadStream(tmpParquetPath);
      readableStream.pipe(res);

      // Clean up!
      res.on('finish', () => {
        fs.unlinkSync(tmpCsvPath);
        fs.unlinkSync(tmpParquetPath);
      });
    });
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
    const users = await this.usersService.findAll();
    return users;
  }

  @Get(':id')
  @Permissions(Permission.UsersFind)
  @ApiResponse({
    status: 200,
    description: 'A single user',
    type: UserWithStatsDto,
  })
  @UseInterceptors(MongooseClassSerializerInterceptor(UserWithStatsDto))
  @ApiParam({ name: 'id', type: 'string' })
  async findOne(
    @Param('id', ObjectIdPipe) id: Types.ObjectId,
  ): Promise<UserWithStatsDto> {
    const user = await this.usersService.findOneById(id);
    if (!user) throw new ApiException(errorMessages.USER_NOT_FOUND);
    return user;
  }

  @Patch(':id')
  @Permissions(Permission.UserUpdateProfile)
  @ApiOperation({
    summary: 'Updates a user',
  })
  @ApiResponse({
    status: 200,
    description: 'Updated user',
    type: UserWithStatsDto,
  })
  @UseInterceptors(MongooseClassSerializerInterceptor(UserWithStatsDto))
  @ApiParam({ name: 'id', type: 'string' })
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
  @ApiParam({ name: 'id', type: 'string' })
  async addRole(
    @Param('id', ObjectIdPipe) id: Types.ObjectId,
    @Body() roleChange: UpdateUserRoleInputDto,
    @Request() request: RequestWithAuthContext,
  ): Promise<UserWithStatsDto> {
    const userWithStats = await this.usersService.addRole(id, roleChange);

    await this.eventLogService.logEventWithAuthContext({
      authContext: request.authContext,
      typeKey: EventLogTypeKey.USER_ACCOUNT,
      description: `Added role ${roleChange.role} to user ${id}`,
    });

    return userWithStats;
  }

  @Patch(':id/removeRole')
  @Permissions(Permission.UsersManageRoles)
  @ApiResponse({
    status: 200,
    description: 'The updated user',
    type: UserWithStatsDto,
  })
  @UseInterceptors(MongooseClassSerializerInterceptor(UserWithStatsDto))
  @ApiParam({ name: 'id', type: 'string' })
  async removeRole(
    @Param('id', ObjectIdPipe) id: Types.ObjectId,
    @Body() roleChange: UpdateUserRoleInputDto,
    @Request() request: RequestWithAuthContext,
  ): Promise<UserWithStatsDto> {
    const userWithStats = await this.usersService.removeRole(id, roleChange);

    await this.eventLogService.logEventWithAuthContext({
      authContext: request.authContext,
      typeKey: EventLogTypeKey.USER_ACCOUNT,
      description: `Removed role ${roleChange.role} from user ${id}`,
    });

    return userWithStats;
  }
}
