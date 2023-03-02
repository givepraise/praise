import * as fs from 'fs';
import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Query,
  Res,
  SerializeOptions,
  StreamableFile,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiOkResponse,
  ApiOperation,
  ApiProduces,
  ApiTags,
} from '@nestjs/swagger';
import { UserAccountsService } from './useraccounts.service';
import { Response } from 'express';
import { ExportInputFormatOnlyDto } from '@/shared/dto/export-input-format-only';
import { allExportsDirPath } from '@/shared/fs.shared';
import { exportContentType } from '@/shared/export.shared';
import { EnforceAuthAndPermissions } from '@/auth/decorators/enforce-auth-and-permissions.decorator';
import { Permission } from '@/auth/enums/permission.enum';
import { Permissions } from '@/auth/decorators/permissions.decorator';
import { UserAccount } from './schemas/useraccounts.schema';
import { ServiceException } from '@/shared/exceptions/service-exception';
import { MongooseClassSerializerInterceptor } from '@/shared/interceptors/mongoose-class-serializer.interceptor';
import { FindUserAccountQueryDto } from './dto/find-user-account-query.dto';
import { CreateUserAccountResponseDto } from './dto/create-user-account-response.dto';
import { CreateUserAccountInputDto } from './dto/create-user-account-input.dto';
import { UpdateUserAccountInputDto } from './dto/update-user-account-input.dto';
import { UpdateUserAccountResponseDto } from './dto/update-user-account-response.dto';

@Controller('useraccounts')
@ApiTags('UserAccounts')
@SerializeOptions({
  excludePrefixes: ['__'],
})
@EnforceAuthAndPermissions()
export class UserAccountsController {
  constructor(private readonly userAccountsService: UserAccountsService) {}

  @Post()
  @ApiOperation({
    summary: 'Create a UserAccount',
  })
  @UseInterceptors(
    MongooseClassSerializerInterceptor(CreateUserAccountResponseDto),
  )
  @Permissions(Permission.UserAccountsCreate)
  async create(
    @Body() createUserAccountBody: CreateUserAccountInputDto,
  ): Promise<CreateUserAccountResponseDto> {
    return this.userAccountsService.create(createUserAccountBody);
  }

  @Get()
  @ApiOperation({
    summary: 'Get UserAccount by UserId our AccountId.',
  })
  @UseInterceptors(MongooseClassSerializerInterceptor(UserAccount))
  @Permissions(Permission.UserAccountsView)
  async findOne(
    @Query() search?: FindUserAccountQueryDto,
  ): Promise<UserAccount> {
    if (!search)
      throw new ServiceException('Search paramaters must be specified.');
    return this.userAccountsService.findOneByIdOrAccountId(search);
  }

  @Patch()
  @ApiOperation({
    summary: 'Update UserAccount by UserId or AccountId',
  })
  @UseInterceptors(
    MongooseClassSerializerInterceptor(UpdateUserAccountResponseDto),
  )
  @Permissions(Permission.UserAccountsUpdate)
  async update(
    @Body() updateUserAccountInputDto: UpdateUserAccountInputDto,
    @Query() search?: FindUserAccountQueryDto,
  ): Promise<UpdateUserAccountResponseDto> {
    if (!search)
      throw new ServiceException('Search paramaters must be specified.');
    const user = await this.userAccountsService.findOneByIdOrAccountId(search);
    return this.userAccountsService.update(user._id, updateUserAccountInputDto);
  }

  @Get('export')
  @ApiOperation({
    summary: 'Exports UserAccounts document to json or csv.',
  })
  @ApiOkResponse({
    schema: {
      type: 'string',
      format: 'binary',
    },
  })
  @ApiProduces('application/octet-stream')
  @ApiProduces('application/json')
  @Permissions(Permission.UserAccountsExport)
  async export(
    @Query() options: ExportInputFormatOnlyDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<StreamableFile> {
    const format = options.format || 'csv';

    // Root path for all exports
    const rootPath = `${allExportsDirPath}/useraccounts`;

    // Directory level 1 is the latest useraccounts id
    const dirLevel1 = (
      await this.userAccountsService.findLatest()
    )._id.toString();

    const dirPath = `${rootPath}/${dirLevel1}`;
    const filePath = `${dirPath}/useraccounts.${format}`;

    if (!fs.existsSync(filePath)) {
      // If cached export don't exist
      if (!fs.existsSync(`${rootPath}/${dirLevel1}`)) {
        // If the latest useraccounts id folder doesn't exist,
        // database hase been updated, clear all cached exports
        fs.rmSync(rootPath, { recursive: true, force: true });
      }

      // Create directory for new export
      fs.mkdirSync(dirPath, { recursive: true });

      // Generate new export files
      await this.userAccountsService.generateAllExports(dirPath);
    }

    res.set({
      'Content-Type': exportContentType(format),
      'Content-Disposition': `attachment; filename="useraccounts.${format}"`,
    });

    const file = fs.createReadStream(filePath);
    return new StreamableFile(file);
  }
}
