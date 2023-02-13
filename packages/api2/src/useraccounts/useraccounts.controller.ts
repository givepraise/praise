import * as fs from 'fs';
import {
  Controller,
  Get,
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
import { BypassAuth } from '@/auth/decorators/bypass-auth.decorator';

@Controller('useraccounts')
@ApiTags('UserAccounts')
@SerializeOptions({
  excludePrefixes: ['__'],
})
export class UserAccountsController {
  constructor(private readonly userAccountsService: UserAccountsService) {}

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
