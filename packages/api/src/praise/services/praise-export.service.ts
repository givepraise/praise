import * as fs from 'fs';
import { InjectModel } from '@nestjs/mongoose';
import { Praise, PraiseExportSqlSchema } from '../schemas/praise.schema';
import { Injectable } from '@nestjs/common';
import { ExportInputDto } from '../../shared/dto/export-input.dto';
import {
  generateParquetExport,
  writeCsvAndJsonExports,
} from '../../shared/export.shared';
import { Model } from 'mongoose';

@Injectable()
export class PraiseExportService {
  constructor(
    @InjectModel(Praise.name)
    private praiseModel: Model<Praise>,
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
    const { startDate, endDate } = options;
    const query: any = {
      createdAt: {
        $gte: startDate,
        $lte: endDate,
      },
    };
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
