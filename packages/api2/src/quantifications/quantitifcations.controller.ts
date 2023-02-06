import * as fs from 'fs';
import {
  Controller,
  Get,
  Query,
  Res,
  SerializeOptions,
  StreamableFile,
  UseGuards,
} from '@nestjs/common';
import { ApiOkResponse, ApiProduces, ApiTags } from '@nestjs/swagger';
import { ApiOperation } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { Permission } from '@/auth/enums/permission.enum';
import { Permissions } from '@/auth/decorators/permissions.decorator';
import { PermissionsGuard } from '@/auth/guards/permissions.guard';
import { QuantificationsService } from './quantifications.service';
import { Quantification } from './schemas/quantifications.schema';
import { Response } from 'express';
import { ExportInputDto } from '@/shared/dto/export-input.dto';
import { allExportsDirPath } from '@/shared/fs.shared';

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
    // const quantifications = await this.quantificationsService.export(options);

    // if (options.format === 'json') return quantifications as Quantification[];

    // res.set({
    //   'Content-Type': 'text/csv',
    //   'Content-Disposition': 'attachment; filename="quantification.csv"',
    // });
    // res.send(quantifications);
    const { format } = options;
    const exportsRootDirName = `${allExportsDirPath}/quantifications`;
    const exportDirName = await this.quantificationsService.getExportDirName();
    const exportId = this.quantificationsService.getExportId(options);
    const exportFilePath = `${exportsRootDirName}/${exportDirName}/${exportId}/quantifications.${format}`;

    // Cached export don't exist, clear cache and generate new export
    if (!fs.existsSync(exportFilePath)) {
      if (!fs.existsSync(`${exportsRootDirName}/${exportDirName}`)) {
        fs.rmSync(exportsRootDirName, { recursive: true, force: true });
      }

      console.log("Export file doesn't exist, generating new export files");
      // Generate new export files
      await this.quantificationsService.generateAllExports(options);
    }

    const file = fs.createReadStream(exportFilePath);
    res.set({
      'Content-Type':
        format === 'json' ? 'application/json' : 'application/octet-stream',
      'Content-Disposition': `attachment; filename="quantifications.${format}"`,
    });
    return new StreamableFile(file);
  }
}
