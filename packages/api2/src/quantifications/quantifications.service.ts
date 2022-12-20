import { PraiseService } from '@/praise/praise.service';
import { SettingsService } from '@/settings/settings.service';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Quantification } from './schemas/quantifications.schema';
import { sum } from 'lodash';
import { Praise } from '@/praise/schemas/praise.schema';
import { ServiceException } from '../shared/service-exception';

export class QuantificationsService {
  constructor(
    @InjectModel(Quantification.name)
    private quantificationModel: Model<Quantification>,
    @InjectModel(Praise.name)
    private praiseModel: Model<Praise>,
    private settingsService: SettingsService,
  ) {}

  /**
   * Digits of precision for rounding calculated scores
   *
   * @type {number}
   */
  DIGITS_PRECISION = 2;

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
   * Returns a quantification by its quantifier and praise
   *
   *  @param {Types.ObjectId} quantifierId
   * @param {Types.ObjectId} praiseId
   * @returns {Promise<Quantification>}
   * @throws {ServiceException}
   **/
  async findOneByQuantifierAndPraise(
    quantifierId: Types.ObjectId,
    praiseId: Types.ObjectId,
  ): Promise<Quantification> {
    const quantification = await this.quantificationModel
      .findOne({ quantifier: quantifierId, praise: praiseId })
      .lean();

    if (!quantification)
      throw new ServiceException('Quantification item not found.');

    return quantification;
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
   * Returns a list of quantifications for a given praiseId
   *
   * @param {Types.ObjectId} praiseId
   * @returns {Promise<Quantification[]>}
   * @throws {ServiceException}
   */
  findQuantificationsByPraiseId = async (
    praiseId: Types.ObjectId,
  ): Promise<Quantification[]> => {
    const quantifications = await this.quantificationModel.find({
      praise: praiseId,
    });

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
    quantifications: Quantification[],
  ): Promise<number> => {
    const completedQuantifications = quantifications.filter((q) =>
      this.isQuantificationCompleted(q),
    );
    if (completedQuantifications.length === 0) return 0;

    const scores = await Promise.all(
      completedQuantifications.map((q) => this.calculateQuantificationScore(q)),
    );

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
    quantification: Quantification,
  ): Promise<number> => {
    let score = quantification.score;

    if (quantification.dismissed) {
      score = 0;
    } else if (quantification.duplicatePraise) {
      score = await this.calculateQuantificationDuplicateScore(quantification);
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
    quantification: Quantification,
  ): Promise<number> => {
    if (!quantification.duplicatePraise)
      throw Error(
        'Quantification does not have duplicatePraise, cannot calculate duplicate score',
      );

    const score = 0;
    const praise = await this.praiseModel.findById(
      quantification.duplicatePraise._id,
    );

    // if (praise && praise.quantifications) {
    //   const originalQuantification = praise.quantifications.find((q) =>
    //     q.quantifier._id.equals(quantification.quantifier._id),
    //   );

    //   if (originalQuantification && originalQuantification.dismissed) {
    //     score = 0;
    //   } else if (originalQuantification && !originalQuantification.dismissed) {
    //     const period = await this.praiseService.getPraisePeriod(praise);
    //     if (!period)
    //       throw new ServiceException('Quantification has no associated period');

    //     score = await this.calculateDuplicateScore(
    //       originalQuantification,
    //       period._id,
    //     );
    //   }
    // }

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
}