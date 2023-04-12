import * as fs from 'fs';
import {
  Controller,
  Get,
  Query,
  Res,
  SerializeOptions,
  StreamableFile,
  Patch,
  Param,
  Body,
  UseInterceptors,
  Request,
} from '@nestjs/common';
import { ApiOkResponse, ApiParam, ApiProduces, ApiTags } from '@nestjs/swagger';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { QuantificationsService } from './services/quantifications.service';
import { Response } from 'express';
import { ExportInputDto } from '../shared/dto/export-input.dto';
import { allExportsDirPath } from '../shared/fs.shared';
import { exportContentType, exportOptionsHash } from '../shared/export.shared';
import { QuantificationsExportService } from './services/quantifications-export.service';
import { EnforceAuthAndPermissions } from '../auth/decorators/enforce-auth-and-permissions.decorator';
import { Permission } from '../auth/enums/permission.enum';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { errorMessages } from '../shared/exceptions/error-messages';
import { ApiException } from '../shared/exceptions/api-exception';
import { Praise } from '../praise/schemas/praise.schema';
import { MongooseClassSerializerInterceptor } from '../shared/interceptors/mongoose-class-serializer.interceptor';
import { ObjectIdPipe } from '../shared/pipes/object-id.pipe';
import { QuantifyInputDto } from './dto/quantify-input.dto';
import { RequestWithAuthContext } from '../auth/interfaces/request-with-auth-context.interface';
import { Types } from 'mongoose';
import { QuantifyMultipleInputDto } from './dto/quantify-multiple-input.dto';

@Controller('quantifications')
@ApiTags('Quantifications')
@SerializeOptions({
  excludePrefixes: ['__'],
})
@EnforceAuthAndPermissions()
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
  async export(
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

    if (!fs.existsSync(filePath)) {
      throw new ApiException(errorMessages.COULD_NOT_CREATE_EXPORT);
    }

    res.set({
      'Content-Type': exportContentType(format),
      'Content-Disposition': `attachment; filename="quantifications.${format}"`,
    });

    const file = fs.createReadStream(filePath);
    return new StreamableFile(file);
  }

  @Patch('multiple')
  @ApiOperation({ summary: 'Quantify multiple praise items' })
  @ApiResponse({
    status: 200,
    description: 'Praise items',
    type: [Praise],
  })
  @Permissions(Permission.PraiseQuantify)
  @UseInterceptors(MongooseClassSerializerInterceptor(Praise))
  async quantifyMultiple(
    @Body() data: QuantifyMultipleInputDto,
    @Request() request: RequestWithAuthContext,
  ): Promise<Praise[]> {
    const { praiseIds, params } = data;

    const userId = new Types.ObjectId(request.authContext?.userId);
    if (!userId) {
      throw new ApiException(errorMessages.USER_NOT_FOUND);
    }

    if (!Array.isArray(praiseIds)) {
      throw new ApiException(errorMessages.PRAISE_IDS_MUST_BE_ARRAY);
    }

    const praiseItems = await Promise.all(
      praiseIds.map(async (praiseId) => {
        const affectedPraises =
          await this.quantificationsService.quantifyPraise(
            userId,
            new Types.ObjectId(praiseId),
            params,
          );

        return affectedPraises;
      }),
    );

    return praiseItems.flat();
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Quantify praise item by id' })
  @ApiResponse({
    status: 200,
    description:
      'Praise /Applications/Visual Studio Code.app/Contents/Resources/app/out/vs/code/electron-sandbox/workbench/workbench.htmlitems',
    type: [Praise],
  })
  @Permissions(Permission.PraiseQuantify)
  @UseInterceptors(MongooseClassSerializerInterceptor(Praise))
  @ApiParam({ name: 'id', type: 'string' })
  async quantify(
    @Param('id', ObjectIdPipe) praiseId: Types.ObjectId,
    @Body() data: QuantifyInputDto,
    @Request() request: RequestWithAuthContext,
  ): Promise<Praise[]> {
    const userId = new Types.ObjectId(request.authContext?.userId);
    if (!userId) {
      throw new ApiException(errorMessages.USER_NOT_FOUND);
    }
    return this.quantificationsService.quantifyPraise(userId, praiseId, data);
  }
}
