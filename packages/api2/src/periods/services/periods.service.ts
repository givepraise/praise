import { Praise, PraiseModel } from '@/praise/schemas/praise.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { Period, PeriodDocument, PeriodModel } from '../schemas/periods.schema';
import { ServiceException } from '../../shared/service-exception';
import { PaginatedQueryDto } from '@/shared/dto/pagination-query.dto';
import { Pagination } from 'mongoose-paginate-ts';
import { CreatePeriodInputDto } from '../dto/create-period-input.dto';
import { add, compareAsc, parseISO } from 'date-fns';
import { EventLogService } from '@/event-log/event-log.service';
import { EventLogTypeKey } from '@/event-log/enums/event-log-type-key';
import { PeriodSettingsService } from '@/periodsettings/periodsettings.service';
import { QuantificationsService } from '@/quantifications/quantifications.service';
import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { isString } from 'class-validator';
import { PeriodDetailsQuantifierDto } from '../dto/period-details-quantifier.dto';
import { PeriodDetailsDto } from '../dto/period-details.dto';
import { PeriodPaginatedResponseDto } from '../dto/period-paginated-response.dto';
import { UpdatePeriodInputDto } from '../dto/update-period-input.dto';
import { PeriodStatusType } from '../enums/status-type.enum';
import { PeriodDetailsGiverReceiverDto } from '../dto/period-details-giver-receiver.dto';
import { PraiseWithUserAccountsWithUserRefDto } from '@/praise/dto/praise-with-user-accounts-with-user-ref.dto';
import { Quantification } from '@/quantifications/schemas/quantifications.schema';
import { QuantificationModel } from '@/database/schemas/quantification/quantification.schema';
@Injectable()
export class PeriodsService {
  constructor(
    @InjectModel(Period.name)
    private periodModel: typeof PeriodModel,
    @InjectModel(Praise.name)
    private praiseModel: typeof PraiseModel,
    @InjectModel(Quantification.name)
    private quantificationModel: typeof QuantificationModel,
    private eventLogService: EventLogService,
    @Inject(forwardRef(() => PeriodSettingsService))
    private periodSettingsService: PeriodSettingsService,
    @Inject(forwardRef(() => QuantificationsService))
    private quantificationsService: QuantificationsService,
  ) {}

  /**
   * Convenience method to get the Period Model
   */
  getModel(): Pagination<PeriodDocument> {
    return this.periodModel;
  }

  /**
   * Find all periods paginated
   */
  async findAllPaginated(
    options: PaginatedQueryDto,
  ): Promise<PeriodPaginatedResponseDto> {
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

    return periodPagination;
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
   * Create a new period
   * */
  create = async (data: CreatePeriodInputDto): Promise<PeriodDetailsDto> => {
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

    // Create period settings
    await this.periodSettingsService.createSettingsForPeriod(period._id);

    await this.eventLogService.logEvent({
      typeKey: EventLogTypeKey.PERIOD,
      description: `Created a new period "${period.name}"`,
    });

    const periodDetailsDto = await this.findPeriodDetails(period._id);

    return periodDetailsDto;
  };

  /**
   * Update a period
   **/
  update = async (
    _id: Types.ObjectId,
    data: UpdatePeriodInputDto,
  ): Promise<PeriodDetailsDto> => {
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
   * @returns {Promise<PeriodDetailsDto>}
   * @throws {ServiceException} if period not found
   * @throws {ServiceException} if period is already closed
   **/
  close = async (_id: Types.ObjectId): Promise<PeriodDetailsDto> => {
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
   **/
  findAllPraise = async (periodId: Types.ObjectId): Promise<Praise[]> => {
    const period = await this.periodModel.findById(periodId);
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
   * Get all praise items from period for a given receiver
   **/
  findAllPraiseByReceiver = async (
    periodId: Types.ObjectId,
    receiverId: Types.ObjectId,
  ): Promise<PraiseWithUserAccountsWithUserRefDto[]> => {
    const period = await this.periodModel.findById(periodId);
    if (!period) throw new ServiceException('Period not found');

    const previousPeriodEndDate = await this.getPreviousPeriodEndDate(period);

    return await this.praiseModel
      .find()
      .where({
        createdAt: { $gt: previousPeriodEndDate, $lte: period.endDate },
        receiver: receiverId,
      })
      .sort({ createdAt: -1 })
      .populate('receiver giver forwarder quantifications')
      .lean();
  };

  /**
   * Get all praise items from period for a given receiver
   **/
  findAllPraiseByGiver = async (
    periodId: Types.ObjectId,
    giverId: Types.ObjectId,
  ): Promise<PraiseWithUserAccountsWithUserRefDto[]> => {
    const period = await this.periodModel.findById(periodId);
    if (!period) throw new ServiceException('Period not found');

    const previousPeriodEndDate = await this.getPreviousPeriodEndDate(period);

    return await this.praiseModel
      .find()
      .where({
        createdAt: { $gt: previousPeriodEndDate, $lte: period.endDate },
        giver: giverId,
      })
      .sort({ createdAt: -1 })
      .populate('receiver giver forwarder quantifications')
      .lean();
  };

  /**
   * Get all praise items from period for a given receiver
   **/
  findAllPraiseByQuantifier = async (
    periodId: Types.ObjectId,
    quantifierId: Types.ObjectId,
  ): Promise<PraiseWithUserAccountsWithUserRefDto[]> => {
    const period = await this.periodModel.findById(periodId);
    if (!period) throw new ServiceException('Period not found');

    const previousPeriodEndDate = await this.getPreviousPeriodEndDate(period);

    const response = await this.praiseModel.aggregate([
      // Include only praise items created in the given period
      {
        $match: {
          createdAt: { $gt: previousPeriodEndDate, $lte: period.endDate },
        },
      },
      // Include all quantifications for the given praise
      {
        $lookup: {
          from: 'quantifications',
          localField: '_id',
          foreignField: 'praise',
          as: 'quantifications',
        },
      },
      // Include only praise items with quantifications for the given quantifier.
      {
        $match: {
          'quantifications.quantifier': quantifierId,
        },
      },
      // Populate the giver, receiver and forwarder fields
      {
        $lookup: {
          from: 'useraccounts',
          localField: 'giver',
          foreignField: '_id',
          as: 'giver',
        },
      },
      {
        $unwind: '$giver',
      },
      {
        $lookup: {
          from: 'useraccounts',
          localField: 'receiver',
          foreignField: '_id',
          as: 'receiver',
        },
      },
      {
        $unwind: '$receiver',
      },
      {
        $lookup: {
          from: 'useraccounts',
          localField: 'forwarder',
          foreignField: '_id',
          as: 'forwarder',
        },
      },
      {
        $unwind: { path: '$forwarder', preserveNullAndEmptyArrays: true },
      },
    ]);

    return response;
  };

  /**
   * Return a PeriodDetails DTO for a given period
   *
   * @param {Period} period
   * @returns {Promise<PeriodDetailsDto>}
   * @throws {ServiceException} if period not found
   * */
  findPeriodDetails = async (
    _id: Types.ObjectId,
  ): Promise<PeriodDetailsDto> => {
    const period = await this.findOneById(_id);
    const previousPeriodEndDate = await this.getPreviousPeriodEndDate(period);

    const [quantifiers, receivers, givers]: [
      PeriodDetailsQuantifierDto[],
      PeriodDetailsGiverReceiverDto[],
      PeriodDetailsGiverReceiverDto[],
    ] = await Promise.all([
      this.findPeriodQuantifiers(period, previousPeriodEndDate),
      this.findPeriodReceivers(period, previousPeriodEndDate),
      this.findPeriodGivers(period, previousPeriodEndDate),
    ]);

    const numberOfPraise = await this.praiseModel.countDocuments({
      createdAt: {
        $gt: previousPeriodEndDate,
        $lte: period.endDate,
      },
    });

    const quantifiersWithCountsData = this.quantifiersWithCounts(quantifiers);

    const periodDetails = {
      ...period,
      numberOfPraise,
      receivers,
      givers,
      quantifiers: [...quantifiersWithCountsData],
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
   * Attach finishedCounts to a list of Praise.quantifiers with details in a period
   */
  quantifiersWithCounts = (
    quantifiers: PeriodDetailsQuantifierDto[],
  ): PeriodDetailsQuantifierDto[] =>
    quantifiers.map((q) => {
      const finishedCount = q.quantifications.filter((quantification) =>
        this.quantificationsService.isQuantificationCompleted(quantification),
      ).length;

      return new PeriodDetailsQuantifierDto({
        _id: q._id,
        username: q.username,
        identityEthAddress: q.identityEthAddress,
        praiseCount: q.praiseCount,
        finishedCount,
        createdAt: q.createdAt,
        updatedAt: q.updatedAt,
      });
    });

  /**
   * Find all quantifiers who quantified praises in the given period
   * @param {Period} period
   * @param {Date} previousPeriodEndDate
   * @returns {Promise<PeriodDetailsQuantifier[]>}
   * */
  findPeriodQuantifiers = async (
    period: Period,
    previousPeriodEndDate: Date,
  ): Promise<PeriodDetailsQuantifierDto[]> => {
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
          as: 'quantification',
        },
      },
      { $unwind: '$quantification' },
      {
        $lookup: {
          from: 'users',
          localField: 'quantification.quantifier',
          foreignField: '_id',
          as: 'user',
        },
      },
      {
        $unwind: '$user',
      },
      {
        $group: {
          _id: '$user._id',
          identityEthAddress: { $first: '$user.identityEthAddress' },
          username: { $first: '$user.username' },
          createdAt: { $first: '$user.createdAt' },
          updatedAt: { $first: '$user.updatedAt' },
          praiseCount: { $sum: 1 },
          quantifications: { $push: '$quantification' },
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
  ): Promise<PeriodDetailsGiverReceiverDto[]> => {
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
        $set: {
          userAccount: { $first: '$userAccounts' },
        },
      },
      {
        $group: {
          _id: '$giver',
          user: { $first: '$userAccount.user' },
          accountId: { $first: '$userAccount.accountId' },
          name: { $first: '$userAccount.name' },
          avatarId: { $first: '$userAccount.avatarId' },
          createdAt: { $first: '$userAccount.createdAt' },
          updatdAt: { $first: '$userAccount.updatedAt' },
          platform: { $first: '$userAccount.platform' },
          praiseCount: { $count: {} },
          score: { $sum: '$score' },
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
  ): Promise<PeriodDetailsGiverReceiverDto[]> => {
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
        $set: {
          userAccount: { $first: '$userAccounts' },
        },
      },
      {
        $group: {
          _id: '$receiver',
          user: { $first: '$userAccount.user' },
          accountId: { $first: '$userAccount.accountId' },
          name: { $first: '$userAccount.name' },
          avatarId: { $first: '$userAccount.avatarId' },
          createdAt: { $first: '$userAccount.createdAt' },
          updatdAt: { $first: '$userAccount.updatedAt' },
          platform: { $first: '$userAccount.platform' },
          praiseCount: { $count: {} },
          score: { $sum: '$score' },
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
