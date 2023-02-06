import * as fs from 'fs';
import * as csv from 'fast-csv';
import { SettingsService } from '@/settings/settings.service';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  QuantificationsExportSqlSchema,
  Quantification,
  QuantificationDocument,
} from './schemas/quantifications.schema';
import { sum, has } from 'lodash';
import { Praise } from '@/praise/schemas/praise.schema';
import { ServiceException } from '../shared/service-exception';
import { PraiseService } from '@/praise/praise.service';
import { Inject, forwardRef } from '@nestjs/common';
import { parse } from 'json2csv';
import { PeriodsService } from '@/periods/services/periods.service';
import { ExportInputDto } from '@/shared/dto/export-input.dto';
import { allExportsDirPath } from '@/shared/fs.shared';
import { exec } from '@/shared/duckdb.shared';
import duckdb from 'duckdb';
import crypto from 'crypto';

export class QuantificationsService {
  constructor(
    @InjectModel(Quantification.name)
    private quantificationModel: Model<Quantification>,
    @Inject(forwardRef(() => SettingsService))
    private settingsService: SettingsService,
    @Inject(forwardRef(() => PraiseService))
    private praiseService: PraiseService,
    @Inject(forwardRef(() => PeriodsService))
    private periodService: PeriodsService,
  ) {}

  /**
   * Digits of precision for rounding calculated scores
   *
   * @type {number}
   */
  DIGITS_PRECISION = 2;

  /**
   * Convenience method to get the Quantification Model
   * @returns
   */
  getModel(): Model<Quantification> {
    return this.quantificationModel;
  }

  /**
   * returns all of the model in json format
   * Do not populate relations
   */
  async export(options: ExportInputDto): Promise<Quantification[] | string> {
    const { periodId, startDate, endDate, format = 'csv' } = options;
    const query = {} as any;

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

    const quantifications = await this.quantificationModel.find(query).lean();

    const fields = [
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

    if (format !== 'csv') return quantifications;
    return quantifications.length > 0
      ? parse(quantifications, { fields })
      : fields.toString();
  }

  async generateCsvExport(options: ExportInputDto) {
    const { periodId, startDate, endDate } = options;
    const query = {} as any;

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

    // Fields to include in the csv
    const includeFields = [
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

    // Serialization rules
    const transform = (doc: any) => ({
      _id: doc._id,
      praise: doc.praise,
      quantifier: doc.quantifier,
      score: doc.score,
      scoreRealized: doc.scoreRealized,
      dismissed: doc.dismissed,
      duplicatePraise: doc.duplicatePraise,
      createdAt: doc.createdAt.toISOString(),
      updatedAt: doc.updatedAt.toISOString(),
    });

    const exportDirName = await this.getExportDirName();
    const exportId = this.getExportId(options);
    const exportDirPath = `${allExportsDirPath}/quantifications/${exportDirName}/${exportId}`;

    // Create the export folder if it doesn't exist
    if (!fs.existsSync(exportDirPath)) {
      fs.mkdirSync(exportDirPath, { recursive: true });
    }

    // Return a promise that resolves when the csv is done
    return new Promise(async (resolve) => {
      // Count the number of documents that match the query and write an empty csv, headers only, if there are none
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

      if (count.length === 0 || count[0].count === 0) {
        fs.writeFileSync(
          `${exportDirPath}/quantifications.csv`,
          includeFields.join(','),
        );
        resolve(true);
        return;
      }

      // Create a cursor to stream the documents
      const cursor = await this.praiseService
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

      // Create a csv writer that transforms the data using our rules
      const csvWriter = csv.format({
        headers: true,
        transform,
      });

      // Pipe the csvWriter to a file
      csvWriter.pipe(
        fs.createWriteStream(`${exportDirPath}/quantifications.csv`),
      );

      // Resolve promise when csvWriter is done
      csvWriter.on('end', () => {
        resolve(true);
      });

      // Pipe the cursor to the csvWriter
      cursor.pipe(csvWriter);
    });
  }

  /**
   * Generates all export files - csv and parquet
   */
  async generateAllExports(options: ExportInputDto) {
    const exportDirName = await this.getExportDirName();
    const exportId = this.getExportId(options);
    const exportDirPath = `${allExportsDirPath}/quantifications/${exportDirName}/${exportId}`;

    await this.generateCsvExport(options);

    // Create a duckdb database, import the csv file, and export it to parquet
    const db = new duckdb.Database(':memory:');
    await exec(
      db,
      `CREATE TABLE quantifications (${QuantificationsExportSqlSchema})`,
    );
    await exec(
      db,
      `COPY quantifications FROM '${exportDirPath}/quantifications.csv' (AUTO_DETECT TRUE, HEADER TRUE);`,
    );
    await exec(
      db,
      `COPY quantifications TO '${exportDirPath}/quantifications.parquet' (FORMAT PARQUET, COMPRESSION ZSTD);`,
    );
  }

  /**
   * The export directory name is the _id of the last inserted document
   */
  async getExportDirName(): Promise<string> {
    const latestAdded = await this.findLatestAdded();
    return latestAdded._id.toString();
  }

  /**
   *  Create a hashed id based on the export options excluding export format
   */
  getExportId(options: ExportInputDto): string {
    const { periodId, startDate, endDate } = options;
    return crypto
      .createHash('sha256')
      .update(JSON.stringify({ periodId, startDate, endDate }))
      .digest('hex');
  }

  /**
   * Returns a quantification by its id
   *
   * @param {Types.ObjectId} _id
   * @returns {Promise<Quantification>}
   * @throws {ServiceException}
   **/
  async findOneById(_id: Types.ObjectId): Promise<Quantification> {
    const quantification = await this.quantificationModel.findById(_id).lean();

    if (!quantification)
      throw new ServiceException('Quantification item not found.');

    return quantification;
  }

  /**
   * Find the lastest added quantification
   */
  async findLatestAdded(): Promise<Quantification> {
    const quantifications = await this.quantificationModel
      .find()
      .limit(1)
      .sort({ $natural: -1 })
      .lean();
    if (!quantifications[0]) throw new ServiceException('Praise not found.');
    return quantifications[0];
  }

  /**
   * Returns a quantification by its quantifier and praise
   *
   *  @param {Types.ObjectId} quantifierId
   * @param {Types.ObjectId} praiseId
   * @returns {Promise<Quantification>}
   * @throws {ServiceException}
   **/
  async findOneByQuantifierAndPraise(
    userId: Types.ObjectId,
    praiseId: Types.ObjectId,
  ): Promise<Quantification> {
    const quantification = await this.quantificationModel.aggregate([
      {
        $match: {
          quantifier: userId,
          praise: praiseId,
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'quantifier',
          foreignField: '_id',
          as: 'quantifier',
        },
      },
      {
        $lookup: {
          from: 'praises',
          localField: 'praise',
          foreignField: '_id',
          as: 'praise',
        },
      },
      {
        $unwind: '$quantifier',
      },
      {
        $unwind: '$praise',
      },
    ]);

    if (!Array.isArray(quantification) || quantification.length === 0)
      throw new ServiceException('Quantification not found.');

    return quantification[0];
  }

  /**
   * Returns a quantifications by its quantifier and duplicate praise id
   *
   *  @param {Types.ObjectId} quantifierId
   * @param {Types.ObjectId} praiseId
   * @returns {Promise<Quantification[]>}
   * @throws {ServiceException}
   **/
  async findByQuantifierAndDuplicatePraise(
    quantifierId: Types.ObjectId,
    praiseId: Types.ObjectId,
  ): Promise<Quantification[]> {
    const quantifications = await this.quantificationModel
      .find({ quantifier: quantifierId, duplicatePraise: praiseId })
      .lean();

    return quantifications;
  }

  /**
   * @param quantifierId
   * @param duplicatePraiseExist
   * @returns Promise<Quantification[]>
   */
  async findByQuantifierAndDuplicatePraiseExist(
    quantifierId: Types.ObjectId,
    duplicatePraiseExist: boolean,
  ): Promise<Quantification[]> {
    const quantifications = await this.quantificationModel
      .find({
        quantifier: quantifierId,
        duplicatePraise: { $exists: duplicatePraiseExist },
      })
      .lean();

    return quantifications;
  }

  /**
   * Returns a list of quantifications for a given praiseId
   *
   * @param {Types.ObjectId} praiseId
   * @returns {Promise<Quantification[]>}
   * @throws {ServiceException}
   */
  findQuantificationsByPraiseId = async (
    praiseId: Types.ObjectId,
  ): Promise<Quantification[]> => {
    const quantifications = await this.quantificationModel
      .find({
        praise: praiseId,
      })
      .lean();

    if (!quantifications) {
      throw new ServiceException(
        `Quantifications for praise ${praiseId} not found`,
      );
    }

    return quantifications;
  };

  /**
   * Check if Quantification was completed
   *
   * @param {Quantification} quantification
   * @returns {boolean}
   */
  isQuantificationCompleted = (quantification: Quantification): boolean => {
    return (
      quantification.dismissed ||
      quantification.duplicatePraise !== undefined ||
      quantification.score > 0
    );
  };

  /**
   * Calculates a single "composite" score from a list of quantifications (of the same praise)
   *
   * @param {Quantification[]} quantifications
   *  list of quantifications to be included in composite score
   * @returns {Promise<number>}
   */
  calculateQuantificationsCompositeScore = async (
    praise: Praise,
    saveQuantifications = true,
  ): Promise<number> => {
    // Get all quantifications for this praise item
    const quantifications = await this.findQuantificationsByPraiseId(
      praise._id,
    );

    // Filter out dismissed quantifications and quantifications that are not completed
    const completedQuantifications = quantifications.filter((q) => {
      if (!this.isQuantificationCompleted(q)) return false;
      if (q.dismissed) return false;
      return true;
    });

    // If no quantifications are completed the score is 0
    if (completedQuantifications.length === 0) return 0;

    // Calculate the score for each quantification
    const scores = await Promise.all(
      completedQuantifications.map((q) => {
        const s = this.calculateQuantificationScore(praise, q);
        return s;
      }),
    );

    // Save the scores to the database
    if (saveQuantifications) {
      for (let i = 0; i < completedQuantifications.length; i++) {
        const q = completedQuantifications[i];
        const s = scores[i];
        await this.quantificationModel.updateOne(
          { _id: q._id },
          { $set: { scoreRealized: s } },
        );
      }
    }

    // Calculate the composite score by averaging the scores of all completed quantifications
    const compositeScore = +(
      sum(scores) / completedQuantifications.length
    ).toFixed(this.DIGITS_PRECISION);

    return compositeScore;
  };

  /**
   * Calculate the score of a given quantification - based on it's manual score value, marked duplicate value, and marked dismissed value
   *
   * @param {Quantification} quantification
   * @returns {Promise<number>}
   */
  calculateQuantificationScore = async (
    praise: Praise,
    quantification: Quantification,
  ): Promise<number> => {
    // The manual score is the score that the quantifier has given to the praise item
    let score = quantification.score;
    // Dismissed oveerrides the manual score and has a score of 0
    if (quantification.dismissed) {
      score = 0;
    } else if (quantification.duplicatePraise) {
      // A duplicate praise overrides the manual/dismissed score and is calculated based on the "original" praise
      score = await this.calculateQuantificationDuplicateScore(
        praise,
        quantification,
      );
    }
    return score;
  };

  /**
   * Find a quantification's duplicatePraise quantification and calculate its score
   *
   * @param {Quantification} quantification
   * @returns {Promise<number>}
   */
  calculateQuantificationDuplicateScore = async (
    praise: Praise,
    quantification: Quantification,
  ): Promise<number> => {
    // Not possible to calculate duplicate score if the quantification is not linked to an original praise
    if (!quantification.duplicatePraise)
      throw Error(
        'Quantification does not have duplicatePraise, cannot calculate duplicate score',
      );

    // Find the original quantification
    const originalQuantification = await this.quantificationModel
      .findOne({
        praise: quantification.duplicatePraise,
        duplicatePraise: undefined,
        quantifier: quantification.quantifier,
      })
      .lean();

    // If no original quantification is found, the score is set to 0
    // This should not happen, but an older version of the api sometimes saved
    // duplicatePraise values without a corresponding original quantification
    if (!originalQuantification) {
      return 0;
    }

    // Find the period associated with the current praise item
    const period = await this.praiseService.getPraisePeriod(praise);
    if (!period) {
      throw new ServiceException('Quantification has no associated period');
    }

    // Calculate the duplicate score based on the original quantification and the period
    const score = await this.calculateDuplicateScore(
      originalQuantification,
      period._id,
    );

    return score;
  };

  /**
   * Calculate a quantification score of a praise marked duplicate
   *
   * @param {Quantification} originalQuantification
   *  the "original" praise's quantification (i.e. the quantification by the same user of the "original" praise instance)
   * @param {Types.ObjectId} periodId
   * @returns {Promise<number>}
   */
  calculateDuplicateScore = async (
    originalQuantification: Quantification,
    periodId: Types.ObjectId,
  ): Promise<number> => {
    // A duplicate praise quantiification is calculated based on the original quantification's score and the duplicatePraisePercentage setting
    const duplicatePraisePercentage = (await this.settingsService.settingValue(
      'PRAISE_QUANTIFY_DUPLICATE_PRAISE_PERCENTAGE',
      periodId,
    )) as number;
    if (!duplicatePraisePercentage)
      throw new ServiceException(
        "Invalid setting 'PRAISE_QUANTIFY_DUPLICATE_PRAISE_PERCENTAGE'",
      );

    const score = +(
      originalQuantification.score * duplicatePraisePercentage
    ).toFixed(this.DIGITS_PRECISION);

    return score;
  };

  /**
   * Update a quantification
   *
   * @param {Quantification} quantification
   * @returns {Promise<Quantification>}
   * @throws {ServiceException}
   */
  updateQuantification = async (
    quantification: Quantification,
  ): Promise<Quantification> => {
    const updatedQuantification = await this.quantificationModel
      .findOneAndUpdate(
        { _id: quantification._id },
        {
          ...quantification,
          quantifier: has(quantification.quantifier, '_id')
            ? quantification.quantifier._id
            : quantification.quantifier,
          praise: has(quantification.praise, '_id')
            ? quantification.praise._id
            : quantification.praise,
          duplicatePraise:
            quantification.duplicatePraise &&
            has(quantification.duplicatePraise, '_id')
              ? quantification.duplicatePraise._id
              : quantification.duplicatePraise,
        },
        {
          new: true,
        },
      )
      .lean();

    if (!updatedQuantification) {
      throw new ServiceException(
        `Quantification ${quantification._id} not found`,
      );
    }

    return updatedQuantification;
  };
}
