import {
  Controller,
  Get,
  Param,
  SerializeOptions,
  UseInterceptors,
} from '@nestjs/common';
import { ReportsService } from './reports.service';
import { CacheInterceptor, CacheTTL } from '@nestjs/common';
import {
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { MongooseClassSerializerInterceptor } from '../shared/interceptors/mongoose-class-serializer.interceptor';
import { ReportManifestDto } from './dto/report-manifest.dto';
import { Types } from 'mongoose';
import { ObjectIdPipe } from '../shared/pipes/object-id.pipe';
import { Public } from '../shared/decorators/public.decorator';
import { ReportsCacheService } from './reports-cache.service';

@Controller('reports')
@UseInterceptors(CacheInterceptor)
@ApiTags('Reports')
@SerializeOptions({
  excludePrefixes: ['__'],
})
/**
 * Controller for managing reports. See https://github.com/givepraise/reports for more information
 * on how to create reports.
 */
export class ReportsController {
  constructor(
    private readonly reportsService: ReportsService,
    private readonly reportsCacheService: ReportsCacheService,
  ) {}

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
  @CacheTTL(60 * 10) // Cache data for 10 minutes
  @UseInterceptors(MongooseClassSerializerInterceptor(ReportManifestDto))
  // Fetch all reports from the service
  listAllReports(): Promise<ReportManifestDto[]> {
    return this.reportsService.listAllReports();
  }

  @Get('receiverBio/:userAccountId')
  @Public()
  @ApiOperation({ summary: 'Get one AI generated receiver bio' })
  @ApiOkResponse({
    description: 'A receiver bio',
    type: String,
  })
  @ApiParam({ name: 'userAccountId', type: 'string' })
  // Fetch a user bio from the service or the cache
  async receiverBio(
    @Param('userAccountId', ObjectIdPipe) userAccountId: Types.ObjectId,
  ): Promise<string> {
    const bioKey = `receiverBio:${userAccountId}`;
    let bio = await this.reportsCacheService.get(bioKey);
    if (!bio) {
      // Bio is not in cache. Generate a new bio and save it to the cache.
      await this.reportsCacheService.set(bioKey, 'Generating contributor bio…'); // Placeholder

      bio = await this.reportsService.getReceiverBio(userAccountId);
      await this.reportsCacheService.set(bioKey, bio, 60 * 60 * 24 * 7); // Cache bio for 1 week
    }
    return bio;
  }

  @Get('receiverLabels/:userAccountId')
  @Public()
  @ApiOperation({
    summary: 'AI generated labels describing a praise receiver.',
  })
  @ApiOkResponse({
    description: 'Comma separated list of labels, 7 max',
    type: String,
  })
  @ApiParam({ name: 'userAccountId', type: 'string' })
  // Fetch a user labels from the service or the cache
  async receiverLabels(
    @Param('userAccountId', ObjectIdPipe) userAccountId: Types.ObjectId,
  ): Promise<string> {
    const labelsKey = `receiverLabels:${userAccountId}`;
    let labels = await this.reportsCacheService.get(labelsKey);
    if (!labels) {
      // Labels are not in cache. Generate new labels and save them to the cache.
      await this.reportsCacheService.set(labelsKey, 'Generating…'); // Placeholder

      labels = await this.reportsService.getReceiverLabels(userAccountId);
      await this.reportsCacheService.set(labelsKey, labels, 60 * 60 * 24 * 7); // Cache labels for 1 week
    }
    return labels;
  }
}
