import {
  Controller,
  Get,
  SerializeOptions,
  UseInterceptors,
} from '@nestjs/common';
import { ReportsService } from './reports.service';
import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';
import {
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { MongooseClassSerializerInterceptor } from '../shared/interceptors/mongoose-class-serializer.interceptor';
import { ReportManifestDto } from './dto/report-manifest.dto';
import { EnforceAuthAndPermissions } from '../auth/decorators/enforce-auth-and-permissions.decorator';

@Controller('reports')
@UseInterceptors(CacheInterceptor)
@ApiTags('Reports')
@SerializeOptions({
  excludePrefixes: ['__'],
})
@EnforceAuthAndPermissions()
/**
 * Controller for managing reports. See https://github.com/givepraise/reports for more information
 * on how to create reports.
 */
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get()
  @ApiOperation({ summary: 'List all report manifests' })
  @ApiOkResponse({
    description: 'A list of report manifests',
    type: [ReportManifestDto],
  })
  @ApiResponse({
    status: 500,
    description: 'An error occurred while fetching report manifests',
  })
  @CacheTTL(60 * 10) // 10 minutes
  @UseInterceptors(MongooseClassSerializerInterceptor(ReportManifestDto))
  listAllReports(): Promise<ReportManifestDto[]> {
    return this.reportsService.listAllReports();
  }
}
