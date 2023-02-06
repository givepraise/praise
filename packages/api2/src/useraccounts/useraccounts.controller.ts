import * as fs from 'fs';
import {
  Controller,
  Get,
  Query,
  Res,
  SerializeOptions,
  StreamableFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiOkResponse,
  ApiOperation,
  ApiProduces,
  ApiTags,
} from '@nestjs/swagger';
import { MongooseClassSerializerInterceptor } from '@/shared/interceptors/mongoose-class-serializer.interceptor';
import { AuthGuard } from '@nestjs/passport';
import { Permission } from '@/auth/enums/permission.enum';
import { Permissions } from '@/auth/decorators/permissions.decorator';
import { PermissionsGuard } from '@/auth/guards/permissions.guard';
import { UserAccount } from './schemas/useraccounts.schema';
import { UserAccountsService } from './useraccounts.service';
import { Response } from 'express';
import { ExportInputFormatOnlyDto } from '@/shared/dto/export-input-format-only';
import { allExportsDirPath } from '@/shared/fs.shared';

@Controller('useraccounts')
@ApiTags('UserAccounts')
@SerializeOptions({
  excludePrefixes: ['__'],
})
// @UseGuards(PermissionsGuard)
// @UseGuards(AuthGuard(['jwt', 'api-key']))
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
  @Permissions(Permission.UserAccountsExport)
  async export(
    @Query() options: ExportInputFormatOnlyDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<StreamableFile> {
    const { format } = options;
    const exportFolderPath = `${allExportsDirPath}/useraccounts`;
    // The export id is the last inserted id in the collection
    const exportId = await this.userAccountsService.getExportDirName();
    const exportFilePath = `${exportFolderPath}/${exportId}/useraccounts.${format}`;

    // Cached export don't exist, clear cache and generate new export
    if (!fs.existsSync(exportFilePath)) {
      if (fs.existsSync(exportFolderPath)) {
        fs.rmSync(exportFolderPath, { recursive: true, force: true });
      }

      console.log("Export file doesn't exist, generating new export files");
      // Generate new export files
      await this.userAccountsService.generateAllExports();
    }

    const file = fs.createReadStream(exportFilePath);
    res.set({
      'Content-Type':
        format === 'json' ? 'application/json' : 'application/octet-stream',
      'Content-Disposition': `attachment; filename="useraccounts.${format}"`,
    });
    return new StreamableFile(file);
  }
}
