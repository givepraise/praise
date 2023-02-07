import * as fs from 'fs';
import { QuantificationsExportSqlSchema } from '../schemas/quantifications.schema';
import { ServiceException } from '@/shared/exceptions/service-exception';
import { PraiseService } from '@/praise/praise.service';
import { Inject, forwardRef } from '@nestjs/common';
import { PeriodsService } from '@/periods/services/periods.service';
import { ExportInputDto } from '@/shared/dto/export-input.dto';
import { exec } from '@/shared/duckdb.shared';
import duckdb from 'duckdb';
import { Transform } from '@json2csv/node';
import stream from 'stream';
import { Cursor } from 'mongoose';

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
   * Creates a write stream that can be used to write the quantifications to a json file
   */
  private createJsonWriter(path: string): stream.Transform {
    const writer = fs.createWriteStream(`${path}/quantifications.json`);

    let separator = '';
    const jsonWriter = new stream.Transform({
      objectMode: true,
      transform: (data, _, done) => {
        writer.write(`${separator}${JSON.stringify(data)}`);
        separator = ',';
        done(null, data);
      },
    });

    writer.write('[');

    jsonWriter.on('finish', () => {
      writer.write(']');
      writer.end();
    });

    return jsonWriter;
  }

  /**
   * Writes the quantifications to a csv and json file
   */
  private async writeCsvAndJsonExports(
    quantifications: Cursor<any, never>,
    path: string,
  ) {
    // Wrap stream transformation in a promise and return
    return new Promise(async (resolve) => {
      const jsonWriter = this.createJsonWriter(path);
      const csvTransformer = new Transform(
        { fields: this.includeFields },
        { objectMode: true },
      );

      const csvWriter = fs.createWriteStream(`${path}/quantifications.csv`);

      quantifications.on('end', () => {
        resolve(true);
      });

      quantifications.pipe(jsonWriter).pipe(csvTransformer).pipe(csvWriter);
    });
  }

  /**
   * Create a duckdb database, import the csv file, and export it to parquet
   */
  private async generateParquetExport(path: string) {
    const db = new duckdb.Database(':memory:');
    await exec(
      db,
      `CREATE TABLE quantifications (${QuantificationsExportSqlSchema})`,
    );
    await exec(
      db,
      `COPY quantifications FROM '${path}/quantifications.csv' (AUTO_DETECT TRUE, HEADER TRUE);`,
    );
    await exec(
      db,
      `COPY quantifications TO '${path}/quantifications.parquet' (FORMAT PARQUET, COMPRESSION ZSTD);`,
    );
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
    await this.writeCsvAndJsonExports(quantifications, path);

    // Generate the parquet file
    await this.generateParquetExport(path);
  }
}
