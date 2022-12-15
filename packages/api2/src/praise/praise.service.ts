import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { PraiseModel, Praise, PraiseDocument } from './schemas/praise.schema';
import { ServiceException } from '../shared/service-exception';
import { QuantifyPraiseProps } from './intefaces/quantify-praise.interface';
import { PeriodStatusType } from '@/periods/enums/status-type.enum';
import { Period } from '@/periods/schemas/periods.schema';
import { SettingsService } from '@/settings/settings.service';
import { QuantificationsService } from '@/quantifications/quantifications.service';
import { FindAllPraisePaginatedQuery } from './dto/find-all-praise-paginated-query.dto';
import { PaginationModel } from '@/shared/dto/pagination-model.dto';
import { Pagination } from 'mongoose-paginate-ts';
import { EventLogService } from '../event-log/event-log.service';
import { EventLogTypeKey } from '@/event-log/enums/event-log-type-key';

@Injectable()
export class PraiseService {
  constructor(
    @InjectModel(Praise.name)
    private praiseModel: typeof PraiseModel,
    @InjectModel(Period.name)
    private periodModel: Model<Period>,
    private settingsService: SettingsService,
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
    const { sortColumn, sortType } = options;
    const query = {} as any;

    if (options.receiver) {
      query.receiver = new Types.ObjectId(options.receiver);
    }

    if (options.giver) {
      query.giver = new Types.ObjectId(options.giver);
    }

    const praisePagination = await this.praiseModel.paginate({
      ...options,
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

  quantifyPraise = async ({
    id,
    bodyParams,
    currentUser,
  }: QuantifyPraiseProps): Promise<Praise[]> => {
    const { score, dismissed, duplicatePraise } = bodyParams;

    const praise = await this.praiseModel
      .findById(id)
      .populate('giver receiver forwarder');

    if (!praise) throw new ServiceException('Praise');

    const period = await this.getPraisePeriod(praise);
    if (!period)
      throw new ServiceException('Praise does not have an associated period');

    if (period.status !== PeriodStatusType.QUANTIFY)
      throw new ServiceException(
        'Period associated with praise does have status QUANTIFY',
      );

    const allowedScore = (await this.settingsService.settingValue(
      'PRAISE_QUANTIFY_ALLOWED_VALUES',
      period._id,
    )) as number[];

    if (!allowedScore.includes(score)) {
      throw new ServiceException(
        `Score ${score} is not allowed. Allowed scores are: ${allowedScore.join(
          ', ',
        )}`,
      );
    }

    const quantification =
      await this.quantificationsService.findOneByQuantifierAndPraise(
        currentUser._id,
        praise._id,
      );

    if (!quantification)
      throw new ServiceException('User not assigned as quantifier for praise.');

    let eventLogMessage = '';

    // Collect all affected praises (i.e. any praises whose scoreRealized will change as a result of this change)
    const affectedPraises: Praise[] = [praise];

    const praisesDuplicateOfThis = await this.findDuplicatePraiseItems(
      praise._id,
      currentUser._id,
    );

    if (praisesDuplicateOfThis?.length > 0)
      affectedPraises.push(...praisesDuplicateOfThis);

    // Modify praise quantification values
    if (duplicatePraise) {
      if (duplicatePraise === praise._id.toString())
        throw new ServiceException('Praise cannot be a duplicate of itself');

      const dp = await this.praiseModel.findById(duplicatePraise);
      if (!dp) throw new ServiceException('Duplicate praise item not found');

      if (praisesDuplicateOfThis?.length > 0)
        throw new ServiceException(
          'Praise cannot be marked duplicate when it is the original of another duplicate',
        );

      const praisesDuplicateOfAnotherDuplicate =
        await this.findPraisesDuplicateOfAnotherDuplicate(
          new Types.ObjectId(duplicatePraise),
          currentUser._id,
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
      quantification.score = score;
      quantification.dismissed = false;
      quantification.duplicatePraise = undefined;

      eventLogMessage = `Gave a score of ${
        quantification.score
      } to the praise with id "${(praise._id as Types.ObjectId).toString()}"`;
    }

    await praise.save();

    await this.eventLogService.logEvent({
      typeKey: EventLogTypeKey.PERMISSION,
      description: eventLogMessage,
      periodId: period._id,
      user: currentUser._id,
    });

    return affectedPraises;
  };

  /**
   * Fetch the period associated with a praise instance,
   *  (as they are currently not related in database)
   *
   * Determines the associated period by:
   *  finding the period with the lowest endDate, that is greater than the praise.createdAt date
   *
   * @param {Praise} praise
   * @returns {(Promise<PeriodDocument | undefined>)}
   */
  getPraisePeriod = async (praise: Praise): Promise<Period | undefined> => {
    const period = await this.periodModel
      .find(
        // only periods ending after praise created
        {
          endDate: { $gte: praise.createdAt },
        },
        null,
        // sort periods by ending date ascending
        {
          sort: { endDate: 1 },
        },

        // select the period with the earliest ending date
      )
      .limit(1);

    if (!period || period.length === 0) return undefined;

    return period[0];
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

    const duplicatePraiseItems = await this.praiseModel.find({
      _id: { $in: duplicateQuantifications.map((q) => q.praise) },
    });

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
}
