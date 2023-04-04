import * as fs from 'fs';
import { QuantificationsExportSqlSchema } from '../schemas/quantifications.schema';
import { ExportInputDto } from '../../shared/dto/export-input.dto';
import { Cursor, Model } from 'mongoose';
import {
  generateParquetExport,
  writeCsvAndJsonExports,
} from '../../shared/export.shared';
import { InjectModel } from '@nestjs/mongoose';
import { Praise } from '../../praise/schemas/praise.schema';

export class QuantificationsExportService {
  constructor(
    @InjectModel(Praise.name)
    private praiseModel: Model<Praise>,
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
    const { startDate, endDate } = options;
    const query = {
      createdAt: {
        $gte: startDate,
        $lte: endDate,
      },
    };
    return query;
  }

  /**
   * Counts the number of quantifications that match the given query
   */
  private async countQuantifications(query: any): Promise<number> {
    const count = await this.praiseModel.aggregate([
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
    return this.praiseModel
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
