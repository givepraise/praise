import * as fs from 'fs';

import {
  generateParquetExport,
  writeCsvAndJsonExports,
} from '../../shared/export.shared';
import { errorMessages } from '../../shared/exceptions/error-messages';
import { PeriodDateRangeDto } from '../dto/period-date-range.dto';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isString } from 'class-validator';
import { parseISO, add, compareAsc } from 'date-fns';
import { Types } from 'mongoose';
import { Pagination } from 'mongoose-paginate-ts';
import { EventLogTypeKey } from '../../event-log/enums/event-log-type-key';
import { EventLogService } from '../../event-log/event-log.service';
import { PraiseWithUserAccountsWithUserRefDto } from '../../praise/dto/praise-with-user-accounts-with-user-ref.dto';
import { Praise, PraiseModel } from '../../praise/schemas/praise.schema';
import { QuantificationsService } from '../../quantifications/services/quantifications.service';
import { PaginatedQueryDto } from '../../shared/dto/pagination-query.dto';
import { ApiException } from '../../shared/exceptions/api-exception';
import { CreatePeriodInputDto } from '../dto/create-period-input.dto';
import { PeriodDetailsGiverReceiverDto } from '../dto/period-details-giver-receiver.dto';
import { PeriodDetailsQuantifierDto } from '../dto/period-details-quantifier.dto';
import { PeriodDetailsDto } from '../dto/period-details.dto';
import { PeriodPaginatedResponseDto } from '../dto/period-paginated-response.dto';
import { UpdatePeriodInputDto } from '../dto/update-period-input.dto';
import { PeriodStatusType } from '../enums/status-type.enum';
import {
  Period,
  PeriodModel,
  PeriodDocument,
  PeriodExportSqlSchema,
} from '../schemas/periods.schema';
import { SettingsService } from '../../settings/settings.service';

@Injectable()
export class PeriodsService {
  constructor(
    @InjectModel(Period.name)
    private periodModel: typeof PeriodModel,
    @InjectModel(Praise.name)
    private praiseModel: typeof PraiseModel,
    private eventLogService: EventLogService,
    private settingsService: SettingsService,
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
      throw new ApiException(errorMessages.FAILED_TO_PAGINATE_PERIOD_DATA);

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
    if (!period) throw new ApiException(errorMessages.PERIOD_NOT_FOUND);
    return period;
  }

  /**
   * Find the latest added period
   */
  async findLatest(): Promise<Period> {
    const period = await this.periodModel
      .find()
      .limit(1)
      .sort({ $natural: -1 })
      .lean();
    if (!period[0]) throw new ApiException(errorMessages.PERIOD_NOT_FOUND);
    return period[0];
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
        throw new ApiException(
          errorMessages.INVALID_END_DATE_FOR_CREATE_PERIOD,
        );
      }
    }

    const period = await this.periodModel.create({ name, endDate });

    // Create period settings
    await this.settingsService.createSettingsForPeriod(period._id);

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
    if (!period) throw new ApiException(errorMessages.PERIOD_NOT_FOUND);

    const { name, endDate } = data;

    if (!name && !endDate)
      throw new ApiException(
        errorMessages.UPDATE_PERIOD_NAME_OR_END_DATE_MUST_BE_SPECIFIED,
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
        throw new ApiException(
          errorMessages.UPDATE_PERIOD_DATE_CHANGE_ONLY_ALLOWED_ON_LATEST_PERIOD,
        );

      if (period.status !== PeriodStatusType.OPEN)
        throw new ApiException(
          errorMessages.DATE_CHANGE_IS_ONLY_ALLOWED_ON_OPEN_PERIODS,
        );

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
    if (!period) throw new ApiException(errorMessages.PERIOD_NOT_FOUND);

    // Check if the period has ended
    const now = Date.now();
    const periodEnd = new Date(period.endDate).getTime();
    if (now < periodEnd)
      throw new ApiException(errorMessages.CANT_CLOSE_NOT_ENDED_PERIOD);

    if (period.status === PeriodStatusType.CLOSED)
      throw new ApiException(errorMessages.PERIOD_IS_ALREADY_CLOSED);

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
  findAllPraise = async (
    periodId: Types.ObjectId,
  ): Promise<PraiseWithUserAccountsWithUserRefDto[]> => {
    const period = await this.periodModel.findById(periodId);
    if (!period) throw new ApiException(errorMessages.PERIOD_NOT_FOUND);

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
    if (!period) throw new ApiException(errorMessages.PERIOD_NOT_FOUND);

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
    if (!period) throw new ApiException(errorMessages.PERIOD_NOT_FOUND);

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
    if (!period) throw new ApiException(errorMessages.PERIOD_NOT_FOUND);

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
    return this.praiseModel.aggregate([
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
    return this.praiseModel.aggregate([
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
    return this.praiseModel.aggregate([
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

  /**
   * Find all Periods where status = QUANTIFY
   *
   * @param {object} [match={}]
   * @returns {Promise<Period[]>}
   */
  findActivePeriods = async (match: object = {}): Promise<Period[]> => {
    let periods: Period[] | Period = await this.periodModel.find({
      status: PeriodStatusType.QUANTIFY,
      ...match,
    });
    if (!Array.isArray(periods)) periods = [periods];

    return periods;
  };

  /**
   * Generate object for use in mongoose queries,
   *  to filter by date range of a Period
   *
   * @param {Period} period
   * @returns {Promise<PeriodDateRangeDto>}
   */
  getPeriodDateRangeQuery = async (
    period: Period,
  ): Promise<PeriodDateRangeDto> => ({
    $gt: await this.getPreviousPeriodEndDate(period),
    $lte: period.endDate,
  });

  /**
   * Generates all export files - csv, json and parquet
   */
  async generateAllExports(path: string) {
    const includeFields = [
      '_id',
      'name',
      'status',
      'endDate',
      'createdAt',
      'updatedAt',
    ];

    // Count the number of documents that matches query
    const count = await this.periodModel.countDocuments({});

    // If there are no documents, create empty files and return
    if (count === 0) {
      fs.writeFileSync(`${path}/periods.csv`, includeFields.join(','));
      fs.writeFileSync(`${path}/periods.json`, '[]');
      return;
    }

    // Lookup the periods, create a cursor
    const periods = this.periodModel.aggregate([]).cursor();

    // Write the csv and json files
    await writeCsvAndJsonExports('periods', periods, path, includeFields);

    // Generate the parquet file
    await generateParquetExport(path, 'periods', PeriodExportSqlSchema);
  }
}
