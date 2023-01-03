import { Praise, PraiseModel } from '@/praise/schemas/praise.schema';
import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { Period, PeriodDocument, PeriodModel } from './schemas/periods.schema';
import { ServiceException } from '../shared/service-exception';
import { PaginationQuery } from '@/shared/dto/pagination-query.dto';
import { PaginationModel } from '@/shared/dto/pagination-model.dto';
import { Pagination } from 'mongoose-paginate-ts';
import { CreatePeriod } from './dto/create-period.dto';
import { add, compareAsc, parseISO } from 'date-fns';
import { EventLogService } from '@/event-log/event-log.service';
import { EventLogTypeKey } from '@/event-log/enums/event-log-type-key';
import { PraiseService } from '../praise/praise.service';
import { PeriodDetailsQuantifier } from './interfaces/period-details-quantifier.interface';
import { PeriodDetailsGiverReceiver } from './interfaces/period-details-giver-receiver.interface';
import { QuantificationsService } from '@/quantifications/quantifications.service';
import { PeriodDetailsQuantifierDto } from './dto/period-details-quantifier.dto';
import { UpdatePeriod } from './dto/update-period.dto';
import { isString } from 'lodash';
import { PeriodStatusType } from './enums/status-type.enum';

@Injectable()
export class PeriodsService {
  constructor(
    @InjectModel(Period.name)
    private periodModel: typeof PeriodModel,
    @InjectModel(Praise.name)
    private praiseModel: typeof PraiseModel,
    private eventLogService: EventLogService,
    @Inject(forwardRef(() => PraiseService))
    private praiseService: PraiseService,
    @Inject(forwardRef(() => QuantificationsService))
    private quantificationsService: QuantificationsService,
  ) {}

  /**
   * Convenience method to get the Period Model
   * @returns
   */
  getModel(): Pagination<PeriodDocument> {
    return this.periodModel;
  }

  /**
   * Find all periods paginated
   *
   * @param options
   * @returns {Promise<PaginationModel<Period>>}
   * @throws {ServiceException}
   */
  async findAllPaginated(
    options: PaginationQuery,
  ): Promise<PaginationModel<Period>> {
    const { sortColumn, sortType, page, limit } = options;
    const query = {} as any;

    const periodPagination = await this.periodModel.paginate({
      page,
      limit,
      query,
      sort: sortColumn && sortType ? { [sortColumn]: sortType } : undefined,
    });

    if (!periodPagination)
      throw new ServiceException('Failed to paginate period data');

    // Map the praise documents to the Praise class
    const docs = periodPagination.docs.map((period) => new Period(period));

    return {
      ...periodPagination,
      docs,
    };
  }

  /**
   * Find a period by its id
   *
   * @param {Types.ObjectId} _id
   * @returns {Promise<Period>}
   */
  async findOneById(_id: Types.ObjectId): Promise<Period> {
    const period = await this.periodModel.findById(_id).lean();
    if (!period) throw new ServiceException('Period not found.');
    return period;
  }

  /**
   * Fetch the period associated with a praise instance,
   *  (as they are currently not related in database)
   *
   * Determines the associated period by:
   *  finding the period with the lowest endDate, that is greater than the praise.createdAt date
   *
   * @param {Praise} praise
   * @returns {(Promise<Period | undefined>)}
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
   * Create a new period
   * @param {Period} period
   * @returns {Promise<Period>}
   * @throws {ServiceException} if period creation fails
   *
   * */
  create = async (data: CreatePeriod): Promise<Period> => {
    const { name, endDate: endDateInput } = data;
    const latestPeriod = await this.periodModel.getLatest();
    const endDate = parseISO(endDateInput);

    if (latestPeriod) {
      const earliestDate = add(latestPeriod.endDate, { days: 7 });
      if (compareAsc(earliestDate, endDate) === 1) {
        throw new ServiceException(
          'End date must be at least 7 days after the latest end date',
        );
      }
    }

    const period = await this.periodModel.create({ name, endDate });
    await this.insertNewPeriodSettings(period);

    await this.eventLogService.logEvent({
      typeKey: EventLogTypeKey.PERIOD,
      description: `Created a new period "${period.name}"`,
    });

    const periodDetailsDto = await this.findPeriodDetails(period._id);

    return periodDetailsDto;
  };

  /**
   * Update a period
   *
   * @param {Types.ObjectId} _id
   * @param {UpdatePeriod} data
   * @returns {Promise<Period>}
   * @throws {ServiceException} if period update fails
   **/
  update = async (_id: Types.ObjectId, data: UpdatePeriod): Promise<Period> => {
    const period = await this.periodModel.findById(_id);
    if (!period) throw new ServiceException('Period not found.');

    const { name, endDate } = data;

    if (!name && !endDate)
      throw new ServiceException(
        'Updated name or endDate to must be specified',
      );

    const eventLogMessages = [];

    if (name) {
      eventLogMessages.push(
        `Updated the name of period "${period.name}" to "${name}"`,
      );

      period.name = name;
    }

    if (isString(endDate)) {
      const latest = await this.isPeriodLatest(period);
      if (!latest)
        throw new ServiceException(
          'Date change only allowed on latest period.',
        );

      if (period.status !== PeriodStatusType.OPEN)
        throw new ServiceException('Date change only allowed on open periods.');

      const newEndDate = parseISO(endDate);

      eventLogMessages.push(
        `Updated the end date of period "${period.name}" to ${endDate} UTC`,
      );

      period.endDate = newEndDate;
    }

    await period.save();

    await this.eventLogService.logEvent({
      typeKey: EventLogTypeKey.PERIOD,
      description: eventLogMessages.join(', '),
    });

    return await this.findPeriodDetails(period._id);
  };

  /**
   * Close a period
   *
   * @param {Types.ObjectId} _id
   * @returns {Promise<Period>}
   * @throws {ServiceException} if period not found
   * @throws {ServiceException} if period is already closed
   **/
  close = async (_id: Types.ObjectId): Promise<Period> => {
    const period = await this.periodModel.findById(_id);
    if (!period) throw new ServiceException('Period not found');

    if (period.status === PeriodStatusType.CLOSED)
      throw new ServiceException('Period is already closed');

    period.status = PeriodStatusType.CLOSED;
    await period.save();

    await this.eventLogService.logEvent({
      typeKey: EventLogTypeKey.PERIOD,
      description: `Closed the period "${period.name}"`,
    });

    return await this.findPeriodDetails(period._id);
  };

  /**
   * Get all praise items from period
   *
   * @param {Types.ObjectId} _id
   * @returns {Promise<Praise[]>}
   * @throws {ServiceException} if period not found
   **/
  praise = async (_id: Types.ObjectId): Promise<Praise[]> => {
    const period = await this.periodModel.findById(_id);
    if (!period) throw new ServiceException('Period not found');

    const previousPeriodEndDate = await this.getPreviousPeriodEndDate(period);

    return await this.praiseModel
      .find()
      .where({
        createdAt: { $gt: previousPeriodEndDate, $lte: period.endDate },
      })
      .sort({ createdAt: -1 })
      .populate('receiver giver forwarder quantifications')
      .lean();
  };

  /**
   * Return a PeriodDetails DTO for a given period
   *
   * @param {Period} period
   * @returns {Promise<PeriodDetails>}
   * @throws {ServiceException} if period not found
   * */
  findPeriodDetails = async (_id: Types.ObjectId) => {
    const period = await this.findOneById(_id);
    const previousPeriodEndDate = await this.getPreviousPeriodEndDate(period);

    const [quantifiers, receivers, givers]: [
      PeriodDetailsQuantifier[],
      PeriodDetailsGiverReceiver[],
      PeriodDetailsGiverReceiver[],
    ] = await Promise.all([
      this.findPeriodQuantifiers(period, previousPeriodEndDate),
      this.findPeriodReceivers(period, previousPeriodEndDate),
      this.findPeriodGivers(period, previousPeriodEndDate),
    ]);

    const quantifiersWithCountsData = this.quantifiersWithCounts(quantifiers);
    // const periodSettings = await PeriodSettingsModel.find({
    //   period: period._id,
    // });

    const periodDetails = {
      ...period,
      receivers,
      givers,
      quantifiers: [...quantifiersWithCountsData],
      // settings: periodSettings,
    };

    return periodDetails;
  };

  /**
   * Fetch the previous period's endDate,
   *  or 1970-01-01 if no previous period exists
   *
   * @param {Period} period
   * @returns {Promise<Date>}
   */
  getPreviousPeriodEndDate = async (period: Period): Promise<Date> => {
    const previousPeriod = await this.periodModel
      .findOne({
        _id: { $ne: period._id },
        endDate: { $lt: period.endDate },
      })
      .sort({ endDate: -1 });

    const previousEndDate = previousPeriod
      ? previousPeriod.endDate
      : new Date(+0);

    return previousEndDate;
  };

  /**
   * Create all default PeriodSettings for a given Period,
   *  by copying all Settings with group PERIOD_DEFAULT
   *
   * @param {PeriodDocument} period
   * @returns {Promise<void>}
   */
  insertNewPeriodSettings = async (period: PeriodDocument): Promise<void> => {
    /**
     * TODO: Insert settings for the period
     */
  };

  /**
   * Attach finishedCounts to a list of Praise.quantifiers with details in a period
   *
   * @param {PeriodDetailsQuantifier[]} quantifiers
   * @returns {PeriodDetailsQuantifierDto[]}
   */
  quantifiersWithCounts = (
    quantifiers: PeriodDetailsQuantifier[],
  ): PeriodDetailsQuantifierDto[] => {
    const quantifiersWithQuantificationCounts = quantifiers.map((q) => {
      const finishedCount = q.quantifications.filter((quantification) =>
        this.quantificationsService.isQuantificationCompleted(quantification),
      ).length;

      return {
        _id: q._id,
        praiseCount: q.praiseCount,
        finishedCount,
      };
    });

    return quantifiersWithQuantificationCounts;
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
      {
        $lookup: {
          from: 'quantifications',
          localField: '_id',
          foreignField: 'praise',
          as: 'quantifications',
        },
      },
      {
        $lookup: {
          from: 'useraccounts',
          localField: 'quantifier',
          foreignField: '_id',
          as: 'userAccount',
        },
      },
      {
        $unwind: '$quantifications',
      },
      {
        $group: {
          _id: '$quantifications.quantifier',
          praiseCount: { $count: {} },
          quantifier: { $first: '$quantifier' },
          quantifications: { $push: '$quantifications' },
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
        $lookup: {
          from: 'useraccounts',
          localField: 'giver',
          foreignField: '_id',
          as: 'userAccounts',
        },
      },
      {
        $group: {
          _id: '$giver',
          praiseCount: { $count: {} },
          score: { $sum: '$score' },
          userAccounts: { $first: '$userAccounts' },
        },
      },
      {
        $sort: {
          _id: 1,
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
        $lookup: {
          from: 'useraccounts',
          localField: 'receiver',
          foreignField: '_id',
          as: 'userAccounts',
        },
      },
      {
        $group: {
          _id: '$receiver',
          praiseCount: { $count: {} },
          score: { $sum: '$score' },
          userAccounts: { $first: '$userAccounts' },
        },
      },
      {
        $sort: {
          _id: 1,
        },
      },
    ]);

    return receivers;
  };

  /**
   * Check if period has the latest endDate of all periods?
   *
   * @param {Period} period
   * @returns {Promise<boolean>}
   */
  isPeriodLatest = async (period: Period): Promise<boolean> => {
    const latestPeriods = await this.periodModel
      .find({})
      .sort({ endDate: -1 })
      .orFail();

    if (latestPeriods.length === 0) return true;
    if (latestPeriods[0]._id.toString() === period._id.toString()) return true;

    return false;
  };
}
