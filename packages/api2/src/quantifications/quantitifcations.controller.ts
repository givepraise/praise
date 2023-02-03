import {
  Controller,
  Get,
  Query,
  Res,
  SerializeOptions,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiParam, ApiTags } from '@nestjs/swagger';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { MongooseClassSerializerInterceptor } from '@/shared/mongoose-class-serializer.interceptor';
import { AuthGuard } from '@nestjs/passport';
import { Permission } from '@/auth/enums/permission.enum';
import { Permissions } from '@/auth/decorators/permissions.decorator';
import { PermissionsGuard } from '@/auth/guards/permissions.guard';
import { QuantificationsService } from './quantifications.service';
import { Quantification } from './schemas/quantifications.schema';
import { Response } from 'express';
import { ExportRequestOptions } from '@/shared/dto/export-request-options.dto';

@Controller('quantifications')
@ApiTags('Quantifications')
@SerializeOptions({
  excludePrefixes: ['__'],
})
@UseInterceptors(MongooseClassSerializerInterceptor(Quantification))
@UseGuards(PermissionsGuard)
@UseGuards(AuthGuard(['jwt', 'api-key']))
export class QuantificationsController {
  constructor(
    private readonly quantificationsService: QuantificationsService,
  ) {}

  @Get('export')
  @ApiOperation({
    summary: 'Exports quantifications document to json or csv.',
  })
  @ApiResponse({
    status: 200,
    description: 'Quantifications export',
    type: [Quantification],
  })
  @Permissions(Permission.QuantificationsExport)
  async findOne(
    @Query() options: ExportRequestOptions,
    @Res({ passthrough: true }) res: Response,
  ): Promise<Quantification[] | undefined> {
    const quantifications = await this.quantificationsService.export(options);

    if (options.format === 'json') return quantifications as Quantification[];

    res.set({
      'Content-Type': 'text/csv',
      'Content-Disposition': 'attachment; filename="quantification.csv"',
    });
    res.send(quantifications);
  }
}
