import {
  Controller,
  Get,
  Param,
  SerializeOptions,
  UseInterceptors,
} from '@nestjs/common';
import { ReportsService } from './reports.service';
import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';
import {
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { MongooseClassSerializerInterceptor } from '../shared/interceptors/mongoose-class-serializer.interceptor';
import { ReportManifestDto } from './dto/report-manifest.dto';
import { EnforceAuthAndPermissions } from '../auth/decorators/enforce-auth-and-permissions.decorator';
import { Types } from 'mongoose';
import { ObjectIdPipe } from '../shared/pipes/object-id.pipe';
import { Public } from '../shared/decorators/public.decorator';
import { KeyvCacheService } from '../database/services/keyv-cache.service';

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
  constructor(
    private readonly reportsService: ReportsService,
    private readonly keyvCacheService: KeyvCacheService,
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
  @CacheTTL(60 * 10) // 10 minutes
  @UseInterceptors(MongooseClassSerializerInterceptor(ReportManifestDto))
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
  async receiverBio(
    @Param('userAccountId', ObjectIdPipe) userAccountId: Types.ObjectId,
  ): Promise<string> {
    const bioKey = `receiverBio:${userAccountId}`;
    const keyv = this.keyvCacheService.getKeyv();
    let bio = await keyv.get(bioKey);
    if (!bio) {
      bio = await this.reportsService.getReceiverBio(userAccountId);
      await keyv.set(bioKey, bio, 60 * 60 * 24 * 7); // 1 week
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
  async receiverLabels(
    @Param('userAccountId', ObjectIdPipe) userAccountId: Types.ObjectId,
  ): Promise<string> {
    const labelsKey = `receiverLabels:${userAccountId}`;
    const keyv = this.keyvCacheService.getKeyv();
    let labels = await keyv.get(labelsKey);
    if (!labels) {
      labels = await this.reportsService.getReceiverLabels(userAccountId);
      await keyv.set(labelsKey, labels, 60 * 60 * 24 * 7); // 1 week
    }
    return labels;
  }
}
