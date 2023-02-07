import * as fs from 'fs';
import { InjectModel } from '@nestjs/mongoose';
import {
  PraiseModel,
  Praise,
  PraiseExportSqlSchema,
} from '../schemas/praise.schema';
import { ServiceException } from '@/shared/exceptions/service-exception';
import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { PeriodsService } from '@/periods/services/periods.service';
import { ExportInputDto } from '@/shared/dto/export-input.dto';
import {
  generateParquetExport,
  writeCsvAndJsonExports,
} from '@/shared/export.shared';
@Injectable()
export class PraiseExportService {
  constructor(
    @InjectModel(Praise.name)
    private praiseModel: typeof PraiseModel,
    @Inject(forwardRef(() => PeriodsService))
    private periodService: PeriodsService,
  ) {}

  includeFields = [
    '_id',
    'giver',
    'forwarder',
    'receiver',
    'reason',
    'reasonRaw',
    'score',
    'sourceId',
    'sourceName',
    'createdAt',
    'updatedAt',
  ];

  /**
   * Converts the ExportInputDto to a query that can be used to filter the praise
   */
  private async exportInputToQuery(options: ExportInputDto) {
    const { periodId, startDate, endDate } = options;
    const query: any = {};
    if (periodId) {
      if (startDate || endDate) {
        // If periodId is set, startDate and endDate should not be set
        throw new ServiceException(
          'Invalid date filtering option. When periodId is set, startDate and endDate should not be set.',
        );
      }
      const period = await this.periodService.findOneById(periodId);
      query.createdAt = await this.periodService.getPeriodDateRangeQuery(
        period,
      );
    } else {
      if (startDate && endDate) {
        // If periodId is not set but startDate and endDate are set, use them to filter
        query.createdAt = {
          $gte: startDate,
          $lte: endDate,
        };
      } else if (startDate || endDate) {
        // If periodId is not set and only one of startDate and endDate is set, throw an error
        throw new ServiceException(
          'Invalid date filtering option. When periodId is not set, both startDate and endDate should be set.',
        );
      }
    }
    return query;
  }

  /**
   * Generates all export files - csv, json and parquet
   */
  async generateAllExports(path: string, options: ExportInputDto) {
    const query = await this.exportInputToQuery(options);

    // Count the number of documents that matches query
    const count = await this.praiseModel.countDocuments(query);

    // If there are no documents, create empty files and return
    if (count === 0) {
      fs.writeFileSync(`${path}/praise.csv`, this.includeFields.join(','));
      fs.writeFileSync(`${path}/praise.json`, '[]');
      return;
    }

    // Lookup the praise, create a cursor
    const praise = this.praiseModel
      .aggregate([
        {
          $match: query,
        },
      ])
      .cursor();

    // Write the csv and json files
    await writeCsvAndJsonExports('praise', praise, path, this.includeFields);

    // Generate the parquet file
    await generateParquetExport(path, 'praise', PraiseExportSqlSchema);
  }
}
