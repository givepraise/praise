import * as fs from 'fs';
import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Res,
  Request,
  SerializeOptions,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiProduces,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { UserAccountsService } from './useraccounts.service';
import { Response } from 'express';
import { exportTmpFilePath } from '../shared/fs.shared';
import { generateParquetExport } from '../shared/export.shared';
import { EnforceAuthAndPermissions } from '../auth/decorators/enforce-auth-and-permissions.decorator';
import { Permission } from '../auth/enums/permission.enum';
import { Permissions } from '../auth/decorators/permissions.decorator';
import {
  UserAccount,
  UserAccountsExportSqlSchema,
} from './schemas/useraccounts.schema';
import { MongooseClassSerializerInterceptor } from '../shared/interceptors/mongoose-class-serializer.interceptor';
import { CreateUserAccountResponseDto } from './dto/create-user-account-response.dto';
import { CreateUserAccountInputDto } from './dto/create-user-account-input.dto';
import { UpdateUserAccountInputDto } from './dto/update-user-account-input.dto';
import { UpdateUserAccountResponseDto } from './dto/update-user-account-response.dto';
import { FindUserAccountFilterDto } from './dto/find-user-account-filter.dto';
import { ObjectIdPipe } from '../shared/pipes/object-id.pipe';
import { Types } from 'mongoose';
import { EventLogService } from '../event-log/event-log.service';
import { RequestWithAuthContext } from '../auth/interfaces/request-with-auth-context.interface';
import * as JSONStream from 'JSONStream';
import { Transform } from '@json2csv/node';
import { Public } from '../shared/decorators/public.decorator';
import { EventLogTypeKey } from '../event-log/enums/event-log-type-key';

const exportIncludeFields = [
  '_id',
  'accountId',
  'user',
  'name',
  'avatarId',
  'platform',
  'createdAt',
  'updatedAt',
];

@Controller('useraccounts')
@ApiTags('UserAccounts')
@SerializeOptions({
  excludePrefixes: ['__'],
})
@EnforceAuthAndPermissions()
export class UserAccountsController {
  constructor(
    private readonly userAccountsService: UserAccountsService,
    private readonly eventLogService: EventLogService,
  ) {}

  @Post()
  @ApiOperation({
    summary: 'Create a UserAccount',
  })
  @UseInterceptors(
    MongooseClassSerializerInterceptor(CreateUserAccountResponseDto),
  )
  @Permissions(Permission.UserAccountsCreate)
  async create(
    @Body() createUserAccountInputDto: CreateUserAccountInputDto,
    @Request() req: RequestWithAuthContext,
  ): Promise<CreateUserAccountResponseDto> {
    const userAccount = await this.userAccountsService.create(
      createUserAccountInputDto,
    );

    this.eventLogService.logEventWithAuthContext({
      authContext: req.authContext,
      typeKey: EventLogTypeKey.USER_ACCOUNT,
      description: `Created UserAccount - id: ${userAccount.accountId}, name: ${userAccount.name}`,
    });

    return userAccount;
  }

  @Get()
  @ApiOperation({
    summary: 'UserAccount list',
  })
  @UseInterceptors(MongooseClassSerializerInterceptor(UserAccount))
  @Permissions(Permission.UserAccountsView)
  async findAll(
    @Query() filter?: FindUserAccountFilterDto,
  ): Promise<UserAccount> {
    return this.userAccountsService.findAll(filter);
  }

  @Get('export/json')
  @ApiOperation({ summary: 'Export userAccounts document to json' })
  @ApiOkResponse({
    schema: {
      type: 'string',
      format: 'binary',
    },
  })
  @ApiProduces('application/json')
  @Public()
  @Permissions(Permission.UserAccountsExport)
  async exportJson(@Res() res: Response) {
    res.set({
      'Content-Type': 'application/json',
      'Content-Disposition': `attachment; filename="useraccounts.json"`,
    });

    // Create a cursor to the userAccounts collection
    const userAccountsCursor = await this.userAccountsService.exportCursor(
      exportIncludeFields,
    );

    // Close the cursor when the response is closed
    res.on('close', () => {
      userAccountsCursor.close();
    });

    userAccountsCursor.pipe(JSONStream.stringify()).pipe(res);
  }

  @Get('export/csv')
  @ApiOperation({ summary: 'Export userAccounts document to csv' })
  @ApiOkResponse({
    schema: {
      type: 'string',
      format: 'binary',
    },
  })
  @ApiProduces('text/csv')
  @Public()
  @Permissions(Permission.UserAccountsExport)
  async exportCsv(@Res() res: Response) {
    res.set({
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="useraccounts.csv"`,
    });

    // Create a cursor to the userAccounts collection
    const userAccountsCursor = await this.userAccountsService.exportCursor(
      exportIncludeFields,
    );

    // Create a transformer to convert the JSON data to CSV
    const csvTransformer = new Transform(
      { fields: exportIncludeFields },
      { objectMode: true },
    );

    // Close the cursor when the response is closed
    res.on('close', () => {
      userAccountsCursor.close();
    });

    userAccountsCursor.pipe(csvTransformer).pipe(res);
  }

  @Get('export/parquet')
  @ApiOperation({ summary: 'Export userAccounts document to parquet' })
  @ApiOkResponse({
    schema: {
      type: 'string',
      format: 'binary',
    },
  })
  @ApiProduces('application/octet-stream')
  @Public()
  @Permissions(Permission.UserAccountsExport)
  async exportParquet(@Res() res: Response) {
    res.set({
      'Content-Type': 'application/octet-stream',
      'Content-Disposition': `attachment; filename="useraccounts.parquet"`,
    });

    // Tmp file paths
    const tmpCsvPath = exportTmpFilePath('useraccounts.csv');
    const tmpParquetPath = exportTmpFilePath('useraccounts.parquet');

    // Create a cursor to the userAccounts collection
    const userAccountsCursor = await this.userAccountsService.exportCursor(
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
    userAccountsCursor.pipe(csvTransformer).pipe(writableStream);

    // When the CSV data is finished, convert it to Parquet and send it as a response
    writableStream.on('finish', async () => {
      // Convert the CSV file to Parquet
      await generateParquetExport(
        'userAccounts',
        UserAccountsExportSqlSchema,
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

  @Get(':id')
  @ApiOperation({
    summary: 'Get a UserAccount.',
  })
  @UseInterceptors(MongooseClassSerializerInterceptor(UserAccount))
  @ApiResponse({
    status: 200,
    description: 'UserAccount',
    type: UserAccount,
  })
  @ApiParam({ name: 'id', type: 'string' })
  @Permissions(Permission.UserAccountsView)
  async findOne(
    @Param('id', ObjectIdPipe) id: Types.ObjectId,
  ): Promise<UserAccount> {
    return this.userAccountsService.findOneById(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update UserAccount',
  })
  @UseInterceptors(
    MongooseClassSerializerInterceptor(UpdateUserAccountResponseDto),
  )
  @Permissions(Permission.UserAccountsUpdate)
  async update(
    @Body() updateUserAccountInputDto: UpdateUserAccountInputDto,
    @Param('id', ObjectIdPipe) id: Types.ObjectId,
    @Request() req: RequestWithAuthContext,
  ): Promise<UpdateUserAccountResponseDto> {
    const userAccount = await this.userAccountsService.update(
      id,
      updateUserAccountInputDto,
    );

    this.eventLogService.logEventWithAuthContext({
      authContext: req.authContext,
      typeKey: EventLogTypeKey.USER_ACCOUNT,
      description: `Updated UserAccount id: ${userAccount.accountId}`,
    });

    return userAccount;
  }
}
