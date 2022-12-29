import { InjectModel } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { PraiseModel, Praise, PraiseDocument } from './schemas/praise.schema';
import { ServiceException } from '../shared/service-exception';
import { PeriodStatusType } from '@/periods/enums/status-type.enum';
import { SettingsService } from '@/settings/settings.service';
import { QuantificationsService } from '@/quantifications/quantifications.service';
import { FindAllPraisePaginatedQuery } from './dto/find-all-praise-paginated-query.dto';
import { PaginationModel } from '@/shared/dto/pagination-model.dto';
import { Pagination } from 'mongoose-paginate-ts';
import { EventLogService } from '../event-log/event-log.service';
import { EventLogTypeKey } from '@/event-log/enums/event-log-type-key';
import { RequestWithUser } from '@/auth/interfaces/request-with-user.interface';
import { PeriodsService } from '@/periods/periods.service';
import { CreateUpdateQuantification } from '@/quantifications/dto/create-update-quantification.dto';
import { RequestContext } from 'nestjs-request-context';
import { Period } from '@/periods/schemas/periods.schema';
import { PeriodDetailsQuantifier } from '@/periods/interfaces/period-details-quantifier.interface';
import { PeriodDetailsGiverReceiver } from '@/periods/interfaces/period-details-giver-receiver.interface';

@Injectable()
export class PraiseService {
  constructor(
    @InjectModel(Praise.name)
    private praiseModel: typeof PraiseModel,
    // private periodsService: PeriodsService,
    // private settingsService: SettingsService,
    private quantificationsService: QuantificationsService,
    private eventLogService: EventLogService,
  ) {}

  /**
   * Convenience method to get the Praise Model
   * @returns
   */
  getModel(): Pagination<PraiseDocument> {
    return this.praiseModel;
  }

  /**
   * Find all praise paginated
   *
   * @param options
   * @returns {Promise<PaginationModel<Praise>>}
   * @throws {ServiceException}
   */
  async findAllPaginated(
    options: FindAllPraisePaginatedQuery,
  ): Promise<PaginationModel<Praise>> {
    const { sortColumn, sortType, receiver, giver, page, limit } = options;
    const query = {} as any;

    if (receiver) {
      query.receiver = receiver;
    }

    if (giver) {
      query.giver = giver;
    }

    const praisePagination = await this.praiseModel.paginate({
      page,
      limit,
      query,
      sort: sortColumn && sortType ? { [sortColumn]: sortType } : undefined,
      populate: [
        {
          path: 'giver',
          populate: { path: 'user', select: 'username' },
        },
        {
          path: 'receiver',
          populate: { path: 'user', select: 'username' },
        },
        {
          path: 'forwarder',
          populate: { path: 'user', select: 'username' },
        },
      ],
    });

    if (!praisePagination)
      throw new ServiceException('Failed to paginate praise data');

    // Map the praise documents to the Praise class
    const docs = praisePagination.docs.map((praise) => new Praise(praise));

    return {
      ...praisePagination,
      docs,
    };
  }

  /**
   * Find one praise by id
   * @param _id
   * @returns {Promise<Praise>}
   * @throws {ServiceException}
   *
   **/
  async findOneById(_id: Types.ObjectId): Promise<Praise> {
    const praise = await this.praiseModel
      .findById(_id)
      .populate('giver receiver forwarder quantifications')
      .lean();

    if (!praise) throw new ServiceException('Praise item not found.');

    return praise;
  }

  /**
   * Quantify praise item
   *
   * @param id {string}
   * @param bodyParams {CreateUpdateQuantification}
   * @returns {Promise<Praise[]>}
   * @throws {ServiceException}
   *
   **/
  quantifyPraise = async (
    id: Types.ObjectId,
    params: CreateUpdateQuantification,
  ): Promise<Praise[]> => {
    const { score, dismissed, duplicatePraise } = params;

    // Get the praise item
    const praise = await this.praiseModel
      .findById(id)
      .populate('giver receiver forwarder')
      .lean();
    if (!praise) throw new ServiceException('Praise item not found');

    // Get the period associated with the praise item
    // const period = await this.periodsService.getPraisePeriod(praise);
    const period = undefined;
    if (!period)
      throw new ServiceException('Praise does not have an associated period');

    // Check if the period is in the QUANTIFY status
    // if (period.status !== PeriodStatusType.QUANTIFY)
    //   throw new ServiceException(
    //     'Period associated with praise does have status QUANTIFY',
    //   );

    // Check that user is assigned as quantifier for the praise item
    const req: RequestWithUser = RequestContext.currentContext.req;
    const quantification =
      await this.quantificationsService.findOneByQuantifierAndPraise(
        req.user._id,
        praise._id,
      );

    if (!quantification)
      throw new ServiceException('User not assigned as quantifier for praise.');

    let eventLogMessage = '';

    // Collect all affected praises (i.e. any praises whose scoreRealized will change as a result of this change)
    const affectedPraises: Praise[] = [praise];

    const praisesDuplicateOfThis = await this.findDuplicatePraiseItems(
      praise._id,
      req.user._id,
    );

    if (praisesDuplicateOfThis?.length > 0)
      affectedPraises.push(...praisesDuplicateOfThis);

    // Modify praise quantification values
    if (duplicatePraise) {
      if (duplicatePraise === praise._id)
        throw new ServiceException('Praise cannot be a duplicate of itself');

      const dp = await this.praiseModel.findById(duplicatePraise).lean();
      if (!dp) throw new ServiceException('Duplicate praise item not found');

      if (praisesDuplicateOfThis?.length > 0)
        throw new ServiceException(
          'Praise cannot be marked duplicate when it is the original of another duplicate',
        );

      const praisesDuplicateOfAnotherDuplicate =
        await this.findPraisesDuplicateOfAnotherDuplicate(
          new Types.ObjectId(duplicatePraise),
          req.user._id,
        );

      if (praisesDuplicateOfAnotherDuplicate?.length > 0)
        throw new ServiceException(
          'Praise cannot be marked duplicate of another duplicate',
        );

      quantification.score = 0;
      quantification.dismissed = false;
      quantification.duplicatePraise = dp;

      eventLogMessage = `Marked the praise with id "${(
        praise._id as Types.ObjectId
      ).toString()}" as duplicate of the praise with id "${(
        dp._id as Types.ObjectId
      ).toString()}"`;
    } else if (dismissed) {
      quantification.score = 0;
      quantification.dismissed = true;
      quantification.duplicatePraise = undefined;

      eventLogMessage = `Dismissed the praise with id "${(
        praise._id as Types.ObjectId
      ).toString()}"`;
    } else {
      if (!score) {
        throw new ServiceException(
          'Score or dismissed or duplicatePraise is required',
        );
      }

      // Check if the score is allowed
      const settingAllowedScores = '0, 144';
      // const settingAllowedScores = (await this.settingsService.settingValue(
      //   'PRAISE_QUANTIFY_ALLOWED_VALUES',
      //   period._id,
      // )) as string;

      const allowedScore = settingAllowedScores.split(',').map(Number);

      if (!allowedScore.includes(score)) {
        throw new ServiceException(
          `Score ${score} is not allowed. Allowed scores are: ${allowedScore.join(
            ', ',
          )}`,
        );
      }

      quantification.score = score;
      quantification.dismissed = false;
      quantification.duplicatePraise = undefined;

      eventLogMessage = `Gave a score of ${
        quantification.score
      } to the praise with id "${(praise._id as Types.ObjectId).toString()}"`;
    }

    await this.quantificationsService.updateQuantification(quantification);

    await this.eventLogService.logEvent({
      typeKey: EventLogTypeKey.PERMISSION,
      description: eventLogMessage,
      // periodId: period._id,
    });

    const docs = affectedPraises.map((p) => new Praise(p));
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
      await this.quantificationsService.findByQuantifierAndDuplicatePraise(
        quantifierId,
        praiseId,
      );

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
   * @param {Types.ObjectId} duplicatePraiseId
   * @param {Types.ObjectId} quantifierId
   * @returns {Promise<Praise[]>}
   *
   **/
  findPraisesDuplicateOfAnotherDuplicate = async (
    duplicatePraiseId: Types.ObjectId,
    quantifierId: Types.ObjectId,
  ): Promise<Praise[]> => {
    const duplicateQuantifications =
      await this.quantificationsService.findByQuantifierAndDuplicatePraiseExist(
        quantifierId,
        true,
      );

    const duplicatePraiseItems = await this.praiseModel.find({
      _id: {
        $in: duplicateQuantifications.map(
          (q) => q.praise._id === duplicatePraiseId,
        ),
      },
    });

    return duplicatePraiseItems;
  };

  /**
   * Find all quantifiers who quantified praises in the given period
   * @param {Period} period
   * @param {Date} previousPeriodEndDate
   * @returns {Promise<PeriodDetailsQuantifier[]>}
   * */
  findPeriodQuantifiers = async (
    period: Period,
    previousPeriodEndDate: Date,
  ): Promise<PeriodDetailsQuantifier[]> => {
    const quantifiers = this.praiseModel.aggregate([
      {
        $match: {
          createdAt: {
            $gt: previousPeriodEndDate,
            $lte: period.endDate,
          },
        },
      },
      { $unwind: '$quantifications' },
      {
        $group: {
          _id: '$quantifications.quantifier',
          praiseCount: { $count: {} },
          quantifications: {
            $push: '$quantifications',
          },
        },
      },
    ]);

    return quantifiers;
  };

  /**
   * Find all givers who gave praises in the given period
   * @param {Period} period
   * @param {Date} previousPeriodEndDate
   * @returns {Promise<PeriodDetailsGiverReceiver[]>}
   * */
  findPeriodGivers = async (
    period: Period,
    previousPeriodEndDate: Date,
  ): Promise<PeriodDetailsGiverReceiver[]> => {
    const givers = this.praiseModel.aggregate([
      {
        $match: {
          createdAt: {
            $gt: previousPeriodEndDate,
            $lte: period.endDate,
          },
        },
      },
      {
        $group: {
          _id: '$giver',
          praiseCount: { $count: {} },
        },
      },
    ]);

    return givers;
  };

  /**
   * Find all receivers who received praises in the given period
   * @param {Period} period
   * @param {Date} previousPeriodEndDate
   * @returns {Promise<PeriodDetailsGiverReceiver[]>}
   * */
  findPeriodReceivers = async (
    period: Period,
    previousPeriodEndDate: Date,
  ): Promise<PeriodDetailsGiverReceiver[]> => {
    const receivers = this.praiseModel.aggregate([
      {
        $match: {
          createdAt: {
            $gt: previousPeriodEndDate,
            $lte: period.endDate,
          },
        },
      },
      {
        $group: {
          _id: '$receiver',
          praiseCount: { $count: {} },
        },
      },
    ]);

    return receivers;
  };
}
