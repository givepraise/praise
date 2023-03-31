import { SettingsService } from '../../settings/settings.service';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Quantification } from '../schemas/quantifications.schema';
import { sum, has } from 'lodash';
import { Praise } from '../../praise/schemas/praise.schema';
import { ApiException } from '../../shared/exceptions/api-exception';
import { PraiseService } from '../../praise/services/praise.service';
import { PeriodsService } from '../../periods/services/periods.service';
import { errorMessages } from '../../shared/exceptions/error-messages';
import { QuantifyInputDto } from '../../praise/dto/quantify-input.dto';
import { PeriodStatusType } from '../../periods/enums/status-type.enum';
import { isQuantificationCompleted } from '../utils/is-quantification-completed';
import { EventLogTypeKey } from '../../event-log/enums/event-log-type-key';
import { EventLogService } from '../../event-log/event-log.service';

export class QuantificationsService {
  constructor(
    @InjectModel(Quantification.name)
    private quantificationModel: Model<Quantification>,
    @InjectModel(Praise.name)
    private praiseModel: Model<Praise>,
    private settingsService: SettingsService,
    private praiseService: PraiseService,
    private periodService: PeriodsService,
    private eventLogService: EventLogService,
  ) {}

  /**
   * Digits of precision for rounding calculated scores
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
   * Returns a quantification by its id
   *
   * @param {Types.ObjectId} _id
   * @returns {Promise<Quantification>}
   * @throws {ServiceException}
   **/
  async findOneById(_id: Types.ObjectId): Promise<Quantification> {
    const quantification = await this.quantificationModel.findById(_id).lean();

    if (!quantification)
      throw new ApiException(errorMessages.QUANTIFICATION_NOT_FOUND);

    return quantification;
  }

  /**
   * Find the lastest added quantification
   */
  async findLatest(): Promise<Quantification> {
    const quantifications = await this.quantificationModel
      .find()
      .limit(1)
      .sort({ $natural: -1 })
      .lean();
    if (!quantifications[0])
      throw new ApiException(errorMessages.PRAISE_NOT_FOUND);
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
      throw new ApiException(errorMessages.QUANTIFICATION_NOT_FOUND);

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
      throw new ApiException(
        errorMessages.QUANTIFICATION_NOT_FOUND,
        `Quantifications for praise ${praiseId} not found`,
      );
    }

    return quantifications;
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

    // Save the scores to the database
    if (saveQuantifications) {
      for await (const q of quantifications) {
        await this.quantificationModel.updateOne(
          { _id: q._id },
          {
            $set: {
              scoreRealized: await this.calculateQuantificationScore(praise, q),
            },
          },
        );
      }
    }

    // Filter out dismissed quantifications and quantifications that are not completed
    const completedQuantifications = quantifications.filter((q) => {
      if (!isQuantificationCompleted(q)) return false;
      return true;
    });

    if (completedQuantifications.length === 0) return 0;

    // Calculate the score for each quantification
    const completedQuantificationsScores = await Promise.all(
      completedQuantifications.map((q) => {
        const s = this.calculateQuantificationScore(praise, q);
        return s;
      }),
    );

    // Calculate the composite score by averaging the scores of all completed quantifications
    const compositeScore = +(
      sum(completedQuantificationsScores) / completedQuantifications.length
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
      throw new ApiException(
        errorMessages.QUANTIFICATION_HAS_NO_ASSOCIATED_PERIOD,
      );
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
      throw new ApiException(
        errorMessages.INVALID_SETTING_PRAISE_QUANTIFY_DUPLICATE_PRAISE_PERCENTAGE,
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
            quantification.duplicatePraise === undefined
              ? null
              : quantification.duplicatePraise &&
                has(quantification.duplicatePraise, '_id')
              ? quantification.duplicatePraise._id
              : quantification.duplicatePraise,
        },
        {
          new: true,
          strict: false,
        },
      )
      .lean();

    if (!updatedQuantification) {
      throw new ApiException(
        errorMessages.QUANTIFICATION_NOT_FOUND,
        `Quantification ${quantification._id} not found`,
      );
    }

    return updatedQuantification;
  };

  /**
   * Quantify praise item
   *
   * @param praiseId {string}
   * @param bodyParams {QuantifyInputDto}
   * @returns An array of all affected praise items
   * @throws {ServiceException}
   *
   **/
  quantifyPraise = async (
    userId: Types.ObjectId,
    praiseId: Types.ObjectId,
    params: QuantifyInputDto,
  ): Promise<Praise[]> => {
    const { score, dismissed, duplicatePraise } = params;

    // Get the praise item in question
    const praise = await this.praiseModel
      .findById(praiseId)
      .populate('giver receiver forwarder')
      .lean();
    if (!praise) throw new ApiException(errorMessages.PRAISE_NOT_FOUND);

    // Get the period associated with the praise item
    const period = await this.periodService.getPraisePeriod(praise);
    if (!period)
      throw new ApiException(
        errorMessages.PRAISE_DOESNT_HAVE__AN_ASSOCIATED_PERIOD,
      );

    // Check if the period is in the QUANTIFY status
    if (period.status !== PeriodStatusType.QUANTIFY)
      throw new ApiException(
        errorMessages.PRAISE_ASSOCIATED_WITH_PRAISE_IS_NOT_QUANTIFY,
      );

    const quantification = await this.findOneByQuantifierAndPraise(
      new Types.ObjectId(userId),
      praise._id,
    );
    if (!quantification) {
      throw new ApiException(
        errorMessages.USER_NOT_ASSIGNED_AS_QUANTIFIER_FOR_PRAISE,
      );
    }

    let eventLogMessage = '';

    // Collect all affected praises (i.e. any praises whose score will change as a result of this change)
    const affectedPraises: Praise[] = [praise];
    const praisesDuplicateOfThis = await this.findDuplicatePraiseItems(
      praise._id,
      new Types.ObjectId(userId),
    );
    if (praisesDuplicateOfThis?.length > 0)
      affectedPraises.push(...praisesDuplicateOfThis);

    if (duplicatePraise) {
      // Check that the duplicatePraise is not the same as the praise item
      if (praise._id.equals(duplicatePraise))
        throw new ApiException(
          errorMessages.PRAISE_CANT_BE_DUPLICATE_OF_ITSELF,
        );

      // Find the original praise item
      const dp = await this.praiseModel.findById(duplicatePraise).lean();
      if (!dp)
        throw new ApiException(errorMessages.DUPLICATE_PRAISE_ITEM_NOT_FOUND);

      // Check that this praise item is not already the original of another duplicate
      if (praisesDuplicateOfThis?.length > 0)
        throw new ApiException(
          errorMessages.ORIGINAL_PRAISE_CANT_BE_MARKED_AS_DUPLICATE,
        );

      // Check that this praise item does not become the duplicate of another duplicate
      const praisesDuplicateOfAnotherDuplicate =
        await this.findPraisesDuplicateOfAnotherDuplicate(
          new Types.ObjectId(duplicatePraise),
          new Types.ObjectId(userId),
        );
      if (praisesDuplicateOfAnotherDuplicate?.length > 0)
        throw new ApiException(
          errorMessages.PRAISE_CANT_BE_MARKED_DUPLICATE_OF_ANOTHER_DUPLICATE,
        );

      // When marking a praise as duplicate, the score is set to 0 and the dismissed flag is cleared
      quantification.score = 0;
      quantification.dismissed = false;
      quantification.duplicatePraise = dp;

      eventLogMessage = `Marked the praise with id "${(
        praise._id as Types.ObjectId
      ).toString()}" as duplicate of the praise with id "${(
        dp._id as Types.ObjectId
      ).toString()}"`;
    } else if (dismissed) {
      // When dismissing a praise, the score is set to 0, any duplicatePraise is cleared and the dismissed flag is set
      quantification.score = 0;
      quantification.dismissed = true;
      quantification.duplicatePraise = undefined;

      eventLogMessage = `Dismissed the praise with id "${(
        praise._id as Types.ObjectId
      ).toString()}"`;
    } else {
      if (score === undefined || score === null) {
        throw new ApiException(
          errorMessages.SCORE_DISMISSED_OR_DUPLICATE_PRAISE_IS_REQUIRED,
        );
      }

      // Check if the score is allowed
      const settingAllowedScores = (await this.settingsService.settingValue(
        'PRAISE_QUANTIFY_ALLOWED_VALUES',
        period._id,
      )) as string;

      const allowedScore = settingAllowedScores.split(',').map(Number);

      if (!allowedScore.includes(score)) {
        throw new ApiException(
          errorMessages.SCORE_IS_NOT_ALLOWED,
          `Score ${score} is not allowed. Allowed scores are: ${allowedScore.join(
            ', ',
          )}`,
        );
      }

      // When quantifying a praise, the score is set, any duplicatePraise is cleared and the dismissed flag is cleared
      quantification.score = score;
      quantification.dismissed = false;
      quantification.duplicatePraise = undefined;

      eventLogMessage = `Gave a score of ${
        quantification.score
      } to the praise with id "${(praise._id as Types.ObjectId).toString()}"`;
    }

    // Save updated quantification
    await this.updateQuantification(quantification);

    const docs: Praise[] = [];

    // Update the score of the praise item and all duplicates
    for (const p of affectedPraises) {
      const score = await this.calculateQuantificationsCompositeScore(p);

      const praiseWithScore: Praise = await this.praiseModel
        .findByIdAndUpdate(
          p._id,
          {
            score,
          },
          { new: true },
        )
        .populate('forwarder quantifications')
        .populate({
          path: 'receiver',
          populate: {
            path: 'user',
          },
        })
        .populate({
          path: 'giver',
          populate: {
            path: 'user',
          },
        })
        .lean();

      docs.push(praiseWithScore);
    }

    await this.eventLogService.logEvent({
      typeKey: EventLogTypeKey.PERMISSION,
      description: eventLogMessage,
      periodId: period._id,
    });

    return docs;
  };

  /**
   * Find all praises that are duplicates of the given praise
   * @param {Types.ObjectId} praiseId
   * @param {Types.ObjectId} quantifierId
   * @returns {Promise<Praise[]>}
   *
   */
  findDuplicatePraiseItems = async (
    praiseId: Types.ObjectId,
    quantifierId: Types.ObjectId,
  ): Promise<Praise[]> => {
    const duplicateQuantifications =
      await this.findByQuantifierAndDuplicatePraise(quantifierId, praiseId);

    const duplicatePraiseItems = await this.praiseModel
      .find({
        _id: { $in: duplicateQuantifications.map((q) => q.praise) },
      })
      .populate('giver receiver forwarder')
      .lean();

    return duplicatePraiseItems;
  };

  /**
   * Find all praises that are duplicates of the given duplicate praise
   * @param {Types.ObjectId} duplicatePraise
   * @param {Types.ObjectId} quantifierId
   * @returns {Promise<Praise[]>}
   *
   **/
  findPraisesDuplicateOfAnotherDuplicate = async (
    duplicatePraise: Types.ObjectId,
    quantifierId: Types.ObjectId,
  ): Promise<Praise[]> => {
    const duplicateQuantifications =
      await this.findByQuantifierAndDuplicatePraiseExist(quantifierId, true);

    const duplicatePraiseItems = await this.praiseModel
      .find({
        _id: {
          $in: duplicateQuantifications.filter(
            (q) => q.praise === duplicatePraise,
          ),
        },
      })
      .lean();

    return duplicatePraiseItems;
  };
}
