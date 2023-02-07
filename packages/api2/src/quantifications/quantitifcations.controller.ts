import * as fs from 'fs';
import {
  Controller,
  Get,
  Query,
  Res,
  SerializeOptions,
  StreamableFile,
} from '@nestjs/common';
import { ApiOkResponse, ApiProduces, ApiTags } from '@nestjs/swagger';
import { ApiOperation } from '@nestjs/swagger';
import { Permission } from '@/auth/enums/permission.enum';
import { Permissions } from '@/auth/decorators/permissions.decorator';
import { QuantificationsService } from './services/quantifications.service';
import { Response } from 'express';
import { ExportInputDto } from '@/shared/dto/export-input.dto';
import { allExportsDirPath } from '@/shared/fs.shared';
import { exportContentType, exportOptionsHash } from '@/shared/export.shared';
import { QuantificationsExportService } from './services/quantifications-export.service';

@Controller('quantifications')
@ApiTags('Quantifications')
@SerializeOptions({
  excludePrefixes: ['__'],
})
// @UseGuards(PermissionsGuard)
// @UseGuards(AuthGuard(['jwt', 'api-key']))
export class QuantificationsController {
  constructor(
    private readonly quantificationsService: QuantificationsService,
    private readonly quantificationsExportService: QuantificationsExportService,
  ) {}

  @Get('export')
  @ApiOperation({
    summary: 'Exports quantifications document to json or csv.',
  })
  @ApiOkResponse({
    schema: {
      type: 'string',
      format: 'binary',
    },
  })
  @ApiProduces('application/octet-stream')
  @ApiProduces('application/json')
  @Permissions(Permission.QuantificationsExport)
  async findOne(
    @Query() options: ExportInputDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<StreamableFile> {
    const format = options.format || 'csv';

    // Root path for all exports
    const rootPath = `${allExportsDirPath}/quantifications`;

    // Directory level 1 is the latest quantifications id
    const dirLevel1 = (
      await this.quantificationsService.findLatest()
    )._id.toString();

    // Directory level 2 is the hashed options
    const dirLevel2 = exportOptionsHash(options);

    const dirPath = `${rootPath}/${dirLevel1}/${dirLevel2}`;
    const filePath = `${dirPath}/quantifications.${format}`;

    if (!fs.existsSync(filePath)) {
      // If cached export don't exist
      if (!fs.existsSync(`${rootPath}/${dirLevel1}`)) {
        // If the latest quantifications id folder doesn't exist,
        // database hase been updated, clear all cached exports
        fs.rmSync(rootPath, { recursive: true, force: true });
      }

      // Create directory for new export
      fs.mkdirSync(dirPath, { recursive: true });

      // Generate new export files
      await this.quantificationsExportService.generateAllExports(
        dirPath,
        options,
      );
    }

    res.set({
      'Content-Type': exportContentType(format),
      'Content-Disposition': `attachment; filename="quantifications.${format}"`,
    });

    const file = fs.createReadStream(filePath);
    return new StreamableFile(file);
  }
}
