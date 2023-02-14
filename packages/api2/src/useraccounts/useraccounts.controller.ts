import * as fs from 'fs';
import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  Res,
  SerializeOptions,
  StreamableFile,
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
import { CreateUserAccountDto } from './dto/create-user-account-input-dto';
import { UpdateUserAccountInputDto } from './dto/update-user-account-input.dto';

@Controller('useraccounts')
@ApiTags('UserAccounts')
@SerializeOptions({
  excludePrefixes: ['__'],
})
@EnforceAuthAndPermissions()
export class UserAccountsController {
  constructor(private readonly userAccountsService: UserAccountsService) {}

  @Get('/:id')
  @ApiOperation({
    summary: 'Fetch User Account',
  })
  @ApiOkResponse({
    description: 'Fetch a User Account by Account Id',
    type: UserAccount
  })
  @ApiProduces('application/json')
  @Permissions(Permission.UserAccountsView)
  async GetOne(
    @Param('id') id: string,
  ): Promise<UserAccount> {
    const userAccount = await this.userAccountsService.findOneByUserAccountId(id);
    if (!userAccount) throw new ServiceException('UserAccount not found.');

    return userAccount;
  }

  @Put('/:id')
  @ApiOperation({
    summary: 'Update a UserAccount by AccountId',
  })
  @ApiOkResponse({
    description: 'Fetch a UserAccount by AccountId',
    type: UserAccount
  })
  @ApiProduces('application/json')
  @Permissions(Permission.UserAccountsUpdate)
  async UpdateOne(
    @Body() updateUserAccountBody: UpdateUserAccountInputDto,
  ): Promise<UserAccount> {
    return this.userAccountsService.updateUserAccount(
      updateUserAccountBody
    );
  }

  @Post()
  @ApiOperation({
    summary: 'Creates the userAccount allowing setting activateToken',
  })
  @ApiOkResponse({
    description: 'Created User Account',
    type: UserAccount
  })
  @ApiProduces('application/json')
  @Permissions(Permission.UserAccountsCreate)
  async create(
    @Body() createUserAccountBody: CreateUserAccountDto,
  ): Promise<UserAccount> {
    return this.userAccountsService.createUserAccount(
      createUserAccountBody
    );
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
