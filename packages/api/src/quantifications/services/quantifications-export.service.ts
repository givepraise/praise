import * as fs from 'fs';
import { QuantificationsExportSqlSchema } from '../schemas/quantifications.schema';
import { ApiException } from '../../shared/exceptions/api-exception';
import { PraiseService } from '../../praise/services/praise.service';
import { Inject, forwardRef } from '@nestjs/common';
import { PeriodsService } from '../../periods/services/periods.service';
import { ExportInputDto } from '../../shared/dto/export-input.dto';
import { Cursor } from 'mongoose';
import {
  generateParquetExport,
  writeCsvAndJsonExports,
} from '../../shared/export.shared';
import { errorMessages } from '../../shared/exceptions/error-messages';

export class QuantificationsExportService {
  constructor(
    @Inject(forwardRef(() => PraiseService))
    private praiseService: PraiseService,
    @Inject(forwardRef(() => PeriodsService))
    private periodService: PeriodsService,
  ) {}

  // Fields to include in the csv
  includeFields = [
    '_id',
    'praise',
    'quantifier',
    'score',
    'scoreRealized',
    'dismissed',
    'duplicatePraise',
    'createdAt',
    'updatedAt',
  ];

  /**
   * Converts the ExportInputDto to a query that can be used to filter the quantifications
   */
  private async exportInputToQuery(options: ExportInputDto) {
    const { periodId, startDate, endDate } = options;
    const query: any = {};
    if (periodId) {
      if (startDate || endDate) {
        // If periodId is set, startDate and endDate should not be set
        throw new ApiException(
          errorMessages.INVALID_PROJECT_ID_FILTERING_PASSING_PROJECT_ID_START_DATE_AND_END_DATE_TOGETHER,
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
        throw new ApiException(
          errorMessages.INVALID_DATE_FILTERING_SHOULD_PATH_DATES_WHEN_PROJECT_ID_IS_NOT_SET,
        );
      }
    }
    return query;
  }

  /**
   * Counts the number of quantifications that match the given query
   */
  private async countQuantifications(query: any): Promise<number> {
    const count = await this.praiseService.getModel().aggregate([
      {
        $match: query,
      },
      {
        $lookup: {
          from: 'quantifications',
          localField: '_id',
          foreignField: 'praise',
          as: 'quantification',
        },
      },
      { $unwind: '$quantification' },
      { $count: 'count' },
    ]);
    return count.length === 0 || count[0].count === 0 ? 0 : count[0].count;
  }

  /**
   * Creates a cursor that can be used to iterate over the quantifications that match the given query
   */
  private async createQuantificationsCursor(
    query: any,
  ): Promise<Cursor<any, never>> {
    return this.praiseService
      .getModel()
      .aggregate([
        {
          $match: query,
        },
        {
          $lookup: {
            from: 'quantifications',
            localField: '_id',
            foreignField: 'praise',
            as: 'quantification',
          },
        },
        { $unwind: '$quantification' },
        {
          $project: {
            _id: '$quantification._id',
            praise: '$quantification.praise',
            quantifier: '$quantification.quantifier',
            score: '$quantification.score',
            scoreRealized: '$quantification.scoreRealized',
            dismissed: '$quantification.dismissed',
            duplicatePraise: '$quantification.duplicatePraise',
            createdAt: '$quantification.createdAt',
            updatedAt: '$quantification.updatedAt',
          },
        },
      ])
      .cursor();
  }

  /**
   * Generates all export files - csv, json and parquet
   */
  async generateAllExports(path: string, options: ExportInputDto) {
    const query = await this.exportInputToQuery(options);

    // Count the number of documents that matches query
    const count = await this.countQuantifications(query);

    // If there are no documents, create empty files and return
    if (count === 0) {
      fs.writeFileSync(
        `${path}/quantifications.csv`,
        this.includeFields.join(','),
      );
      fs.writeFileSync(`${path}/quantifications.json`, '[]');
      return;
    }

    // Lookup the quantifications, create a cursor
    const quantifications = await this.createQuantificationsCursor(query);

    // Write the csv and json files
    await writeCsvAndJsonExports(
      'quantifications',
      quantifications,
      path,
      this.includeFields,
    );

    // Generate the parquet file
    await generateParquetExport(
      path,
      'quantifications',
      QuantificationsExportSqlSchema,
    );
  }
}
