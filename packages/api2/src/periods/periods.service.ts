import { Praise, PraiseModel } from '@/praise/schemas/praise.schema';
import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { Period, PeriodDocument, PeriodModel } from './schemas/periods.schema';
import { ServiceException } from '../shared/service-exception';
import { PaginatedQueryDto } from '@/shared/dto/pagination-query.dto';
import { Pagination } from 'mongoose-paginate-ts';
import { CreatePeriodInputDto } from './dto/create-period-input.dto';
import { add, compareAsc, parseISO } from 'date-fns';
import { EventLogService } from '@/event-log/event-log.service';
import { EventLogTypeKey } from '@/event-log/enums/event-log-type-key';
import { PraiseService } from '../praise/praise.service';
import { PeriodDetailsQuantifier } from './interfaces/period-details-quantifier.interface';
import { PeriodDetailsGiverReceiver } from './interfaces/period-details-giver-receiver.interface';
import { QuantificationsService } from '@/quantifications/quantifications.service';
import { PeriodDetailsQuantifierDto } from './dto/period-details-quantifier.dto';
import { UpdatePeriodInputDto } from './dto/update-period-input.dto';
import { isString, some } from 'lodash';
import { PeriodStatusType } from './enums/status-type.enum';
import { PeriodPaginatedResponseDto } from './dto/period-paginated-response.dto';
import { SettingsService } from '@/settings/settings.service';
import { UserRole } from '@/users/interfaces/user-roles.interfce';
import { User, UserModel } from '@/users/schemas/users.schema';
import { VerifyQuantifierPoolSizeDto } from './dto/verify-quantifiers-pool-size.dto';
import { Assignments } from './dto/assignments.dto';
import { Receiver } from '@/praise/interfaces/receiver.interface';
import { Quantifier } from '@/praise/interfaces/quantifier.interface.';
import greedyPartitioning from 'greedy-number-partitioning';
import { firstFit, PackingOutput } from 'bin-packer';
import flatten from 'lodash/flatten';
import intersection from 'lodash/intersection';
import range from 'lodash/range';
import sum from 'lodash/sum';
import zip from 'lodash/zip';
import every from 'lodash/every';
import { UserAccount } from '@/useraccounts/schemas/useraccounts.schema';
import { QuantifierPoolById } from './interfaces/quantifier-pool-by-id.interface';
import { PeriodDetailsDto } from './dto/period-details.dto';
import { PeriodDateRangeDto } from './dto/period-date-range.dto';
import { PeriodReplaceQuantifierInputDto } from './dto/replace-quantifier-input.dto';
import { PeriodReplaceQuantifierResponseDto } from './dto/replace-quantifier-reponse.dto';

@Injectable()
export class PeriodsService {
  constructor(
    @InjectModel(Period.name)
    private periodModel: typeof PeriodModel,
    @InjectModel(Praise.name)
    private praiseModel: typeof PraiseModel,
    @InjectModel(User.name)
    private userModel: typeof UserModel,
    @InjectModel(UserAccount.name)
    private userAccountModel: typeof UserAccountModel,
    @Inject(forwardRef(() => PraiseService))
    private SettingsService: PraiseService,
    @Inject(forwardRef(() => QuantificationsService))
    private quantificationsService: QuantificationsService,
    @Inject(forwardRef(() => SettingsService))
    private settingsService: SettingsService,
    private eventLogService: EventLogService,
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
  create = async (data: CreatePeriodInputDto): Promise<Period> => {
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
   * @param {UpdatePeriodInputDto} data
   * @returns {Promise<Period>}
   * @throws {ServiceException} if period update fails
   **/
  update = async (
    _id: Types.ObjectId,
    data: UpdatePeriodInputDto,
  ): Promise<Period> => {
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
   * @returns {Promise<PeriodDetailsDto>}
   * @throws {ServiceException} if period not found
   * */
  findPeriodDetails = async (
    _id: Types.ObjectId,
  ): Promise<PeriodDetailsDto> => {
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

  /**
   * Return quantifier pool size and needed quantifier pool size
   * @param {Period} period
   * @returns {Promise<boolean>}
   * */
  verifyQuantifierPoolSize = async (
    _id: Types.ObjectId,
  ): Promise<VerifyQuantifierPoolSizeDto> => {
    const period = await this.findOneById(_id);

    const PRAISE_QUANTIFIERS_ASSIGN_EVENLY =
      (await this.settingsService.settingValue(
        'PRAISE_QUANTIFIERS_ASSIGN_EVENLY',
        period._id,
      )) as boolean;

    const quantifierPoolSize = await this.userModel.count({
      roles: UserRole.QUANTIFIER,
    });

    let response;

    if (PRAISE_QUANTIFIERS_ASSIGN_EVENLY) {
      response = {
        quantifierPoolSize,
        quantifierPoolSizeNeeded: quantifierPoolSize,
        quantifierPoolDeficitSize: 0,
      };
    } else {
      const assignments = await this.assignQuantifiersDryRun(_id);

      response = {
        quantifierPoolSize,
        quantifierPoolSizeNeeded: assignments.poolAssignments.length,
        quantifierPoolDeficitSize: assignments.remainingAssignmentsCount,
      };
    }

    return response;
  };

  assignQuantifiers = async (
    _id: Types.ObjectId,
  ): Promise<PeriodDetailsDto> => {
    const period = await this.findOneById(_id);

    if (period.status !== 'OPEN')
      throw new ServiceException(
        'Quantifiers can only be assigned on OPEN periods.',
      );

    const anyPraiseAssigned = await this.isAnyPraiseAssigned(period);
    if (anyPraiseAssigned)
      throw new ServiceException(
        'Some praise has already been assigned for this period',
      );

    // Make five attempts at assigning quantifiers
    // Since the algorithm is random, it's possible that the first attempt
    // will fail to assign all quantifiers.
    let assignedQuantifiers;
    for (let i = 0; i < 5; i++) {
      assignedQuantifiers = await this.assignQuantifiersDryRun(_id);
      if (assignedQuantifiers.remainingAssignmentsCount === 0) break;
    }

    if (!assignedQuantifiers) {
      throw new Error('Failed to assign quantifiers.');
    }

    if (assignedQuantifiers.remainingAssignmentsCount > 0) {
      throw new ServiceException(
        `Failed to assign ${assignedQuantifiers.remainingAssignmentsCount} collection of praise to a quantifier`,
      );
    }

    try {
      // Generate list of db queries to apply changes specified by assignedQuantifiers
      const bulkQueries = flatten(
        assignedQuantifiers.poolAssignments.map((q) =>
          q.receivers.map((receiver) => ({
            updateMany: {
              filter: { _id: { $in: receiver.praiseIds } },
              update: {
                $push: {
                  quantifications: {
                    quantifier: q._id,
                  },
                },
              },
            },
          })),
        ),
      );

      // 2022-06-30
      // Ignoring this TS error that new quantification object does not meet expected type
      //  It may be related to running $push within an updateMany within a bulkWrite *for a sub-document type*
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      await PraiseModel.bulkWrite(bulkQueries);
    } catch (e) {
      await this.eventLogService.logEvent({
        typeKey: EventLogTypeKey.PERIOD,
        description: `Failed to assign random quantifiers to all praise in period "${period.name}", retrying...`,
      });
    }

    await PeriodModel.updateOne(
      { _id: period._id },
      { $set: { status: PeriodStatusType.QUANTIFY } },
    );

    await this.eventLogService.logEvent({
      typeKey: EventLogTypeKey.PERIOD,
      description: `Assigned random quantifiers to all praise in period "${period.name}"`,
    });

    return await this.findPeriodDetails(period._id);
  };

  replaceQuantifier = async (
    _id: Types.ObjectId,
    replaceQuantifierInputDto: PeriodReplaceQuantifierInputDto,
  ): Promise<PeriodReplaceQuantifierResponseDto> => {
    const {
      quantifierId: currentQuantifierId,
      quantifierIdNew: newQuantifierId,
    } = replaceQuantifierInputDto;
    const period = await this.findOneById(_id);

    if (period.status !== 'QUANTIFY')
      throw new ServiceException(
        'Quantifiers can only be replaced on periods with status QUANTIFY.',
      );

    if (!currentQuantifierId || !newQuantifierId)
      throw new ServiceException(
        'Both originalQuantifierId and newQuantifierId must be specified',
      );

    if (currentQuantifierId === newQuantifierId)
      throw new ServiceException('Cannot replace a quantifier with themselves');

    const currentQuantifier = await this.userModel.findById(
      currentQuantifierId,
    );
    if (!currentQuantifier)
      throw new ServiceException('Current quantifier does not exist');

    const newQuantifier = await this.userModel.findById(newQuantifierId);
    if (!newQuantifier)
      throw new ServiceException('Replacement quantifier does not exist');

    if (!newQuantifier.roles.includes(UserRole.QUANTIFIER))
      throw new ServiceException(
        'Replacement quantifier does not have role QUANTIFIER',
      );

    const dateRangeQuery = await this.getPeriodDateRangeQuery(period);

    const praiseAlreadyAssignedToNewQuantifier = await this.praiseModel.find({
      // Praise within time period
      createdAt: dateRangeQuery,

      // Both original and new quantifiers assigned
      $and: [
        { 'quantifications.quantifier': currentQuantifierId },
        { 'quantifications.quantifier': newQuantifierId },
      ],
    });

    if (praiseAlreadyAssignedToNewQuantifier?.length > 0)
      throw new ServiceException(
        "Replacement quantifier is already assigned to some of the original quantifier's praise",
      );

    const affectedPraiseIds = await this.praiseModel
      .find({
        // Praise within time period
        createdAt: dateRangeQuery,

        // Original quantifier
        'quantifications.quantifier': currentQuantifierId,
      })
      .lean();

    const newQuantifierAccounts = await this.userAccountModel
      .find({
        user: newQuantifierId,
      })
      .lean();

    if (newQuantifierAccounts) {
      affectedPraiseIds.find((p) => {
        for (const ua of newQuantifierAccounts) {
          if (ua._id.equals(p.receiver)) {
            throw new ServiceException(
              'Replacement quantifier cannot be assigned to quantify their own received praise.',
            );
          }
        }
      });
    }

    await this.praiseModel.updateMany(
      {
        // Praise within time period
        createdAt: dateRangeQuery,

        // Original quantifier
        'quantifications.quantifier': currentQuantifierId,
      },
      {
        $set: {
          // Reset score
          'quantifications.$[elem].score': 0,
          'quantifications.$[elem].dismissed': false,

          // Assign new quantifier
          'quantifications.$[elem].quantifier': newQuantifierId,
        },
        $unset: {
          'quantifications.$[elem].duplicatePraise': 1,
        },
      },
      {
        arrayFilters: [
          {
            'elem.quantifier': currentQuantifierId,
          },
        ],
      },
    );

    await this.eventLogService.logEvent({
      typeKey: EventLogTypeKey.PERIOD,
      description: `Reassigned all praise in period "${period.name}" that is currently assigned to user with id "${currentQuantifierId}", to user with id "${newQuantifierId}"`,
    });

    const updatedPraises = await this.praiseModel
      .find({
        _id: { $in: affectedPraiseIds },
      })
      .populate('giver receiver forwarder');

    const periodDetailsDto = await this.findPeriodDetails(periodId);

    return {
      period: periodDetailsDto,
      praises: updatedPraises,
    };
  };

  assignQuantifiersDryRun = async (
    _id: Types.ObjectId,
  ): Promise<Assignments> => {
    const period = await this.findOneById(_id);

    const PRAISE_QUANTIFIERS_ASSIGN_EVENLY =
      (await this.settingsService.settingValue(
        'PRAISE_QUANTIFIERS_ASSIGN_EVENLY',
        period._id,
      )) as boolean;

    const PRAISE_QUANTIFIERS_PER_PRAISE_RECEIVER =
      (await this.settingsService.settingValue(
        'PRAISE_QUANTIFIERS_PER_PRAISE_RECEIVER',
        period._id,
      )) as number;

    if (PRAISE_QUANTIFIERS_ASSIGN_EVENLY) {
      return this.prepareAssignmentsEvenly(
        period,
        PRAISE_QUANTIFIERS_PER_PRAISE_RECEIVER,
      );
    } else {
      const PRAISE_PER_QUANTIFIER = (await this.settingsService.settingValue(
        'PRAISE_PER_QUANTIFIER',
        period._id,
      )) as number;

      const targetBinSize = Math.ceil(PRAISE_PER_QUANTIFIER * 1.2);

      return this.prepareAssignmentsByTargetPraiseCount(
        period,
        PRAISE_QUANTIFIERS_PER_PRAISE_RECEIVER,
        targetBinSize,
      );
    }
  };

  prepareAssignmentsEvenly = async (
    period: Period,
    PRAISE_QUANTIFIERS_PER_PRAISE_RECEIVER: number,
  ): Promise<Assignments> => {
    // Query a list of receivers with their collection of praise
    const receivers: Receiver[] = await this.queryReceiversWithPraise(period);

    // Query the list of quantifiers & randomize order
    const quantifierPool = await this.queryQuantifierPoolRandomized();

    // Check that there are more quantifiers in the pool than redundant praise to be assigned
    //  otherwise a quantifier could be assigned the same praise multiple times
    if (PRAISE_QUANTIFIERS_PER_PRAISE_RECEIVER > quantifierPool.length)
      throw new Error(
        'Unable to assign redundant quantifications without more members in quantifier pool',
      );

    // Check that the number of redundant assignments is greater than to the number of receivers
    //    otherwise a quantifier could be assigned the same praise multiple times
    if (PRAISE_QUANTIFIERS_PER_PRAISE_RECEIVER > receivers.length)
      throw new Error(
        'Quantifiers per Receiver is too large for the number of receivers, unable to prevent duplicate assignments',
      );

    // Run "Greedy number partitioning" algorithm:
    //    Places any number of "items" into "bins", where there are a *fixed* number of bins, each with *dynamic* capacity.
    //    Each item takes up some amount of space in a bin.
    //
    //    Attempts to distribute space taken up in bins as evenly as possible between all bins.
    //
    //    For our use case:
    //    - Bin: quantifier
    //    - Item: receiver
    //    - Number of Bins: quantifier pool size
    //    - Size of each Item: receivers's praise count
    const receiversDistributedByPraiseCount: Receiver[][] =
      greedyPartitioning<Receiver>(
        receivers, // Items to place in bins
        quantifierPool.length, // Available bins
        (r: Receiver) => r.praiseCount, // Bin space taken by each item
      );

    /**
     * Generate redundant copies, without overlapping assignments
     * Then, transform into create groups of unique receivers ready for assignment to a single quantifier
     *
     * Example: For 3 redundant quantifications of 4 receivers a, b, c, d
     *  to be assigned to 4 quantifiers
     *
     * If greedy number partitioning gives us:
     *  [[a, b], [c], [d], [e,f,g]]
     *
     *
     * Generate:
     *  [
     *    [[a, b], [c], [d], [e,f,g]],
     *    [[e,f,g], [a, b], [c], [d]],
     *    [[d], [e,f,g], [a, b], [c]],
     *  ]
     *
     * Zipped to:
     *  [
     *    [[a, b], [e,f,g], [d]],
     *    [[c], [a,b], [e,f,g]],
     *    [[d], [c], [a, b]],
     *    [[e,f,g], [d], [c]]
     *  ]
     *
     * Flattened to:
     * [
     *    [a, b, e, f, g, d],
     *    [c, a, b, e, f, g],
     *    [d, c, a, b],
     *    [e, f, g, d, c]
     * ]
     */

    const redundantAssignmentBins: Receiver[][] = zip(
      ...range(PRAISE_QUANTIFIERS_PER_PRAISE_RECEIVER).map((rotations) => {
        const receiversShuffledClone = [...receiversDistributedByPraiseCount];

        // "Rotate" array back-to-front (i.e. [a,b,c,d] -> [d,a,b,c])
        range(rotations).forEach(() => {
          const lastElem = receiversShuffledClone.pop();
          if (!lastElem)
            throw Error(
              'Failed to generate list of redundant shuffled receivers',
            );

          receiversShuffledClone.unshift(lastElem);
        });

        return receiversShuffledClone;
      }),
    )
      .map((binOfBins) =>
        binOfBins.map((bins) =>
          bins === undefined ? ([] as Receiver[]) : bins,
        ),
      )
      .map((binOfBins) => flatten(binOfBins));

    // Randomly assign each quantifier to an array of unique receivers
    const assignments = this.generateAssignments(
      redundantAssignmentBins,
      quantifierPool,
    );

    await this.verifyAssignments(
      period,
      PRAISE_QUANTIFIERS_PER_PRAISE_RECEIVER,
      assignments,
    );

    return assignments;
  };

  /**
   * Query a list of receivers with their collection of praise
   * @param period
   **/
  queryReceiversWithPraise = async (period: Period): Promise<Receiver[]> => {
    const previousPeriodEndDate = await this.getPreviousPeriodEndDate(period);

    return this.praiseModel.aggregate([
      {
        $match: {
          createdAt: { $gt: previousPeriodEndDate, $lte: period.endDate },
        },
      },
      {
        $group: {
          _id: '$receiver',
          praiseCount: { $count: {} },
          praiseIds: {
            $push: '$_id',
          },
        },
      },

      // Sort descending as first step of "First Fit Decreasing" bin-packing algorithm
      {
        $sort: {
          praiseCount: -1,
        },
      },
    ]);
  };

  /**
   * Get all quantifiers in random order
   *
   * @returns
   */
  queryQuantifierPoolRandomized = async (): Promise<Quantifier[]> => {
    let quantifierPool = await this.userModel.aggregate([
      { $match: { roles: UserRole.QUANTIFIER } },
      {
        $lookup: {
          from: 'useraccounts',
          localField: '_id',
          foreignField: 'user',
          as: 'accounts',
        },
      },
      {
        $addFields: {
          receivers: [],
        },
      },
    ]);

    quantifierPool = quantifierPool
      .sort(() => 0.5 - Math.random())
      .slice(0, quantifierPool.length);

    return quantifierPool;
  };

  /**
   * Assign quantifiers to bins of receivers
   *
   * @param assignmentBins
   * @param quantifierPool
   * @returns
   */
  generateAssignments = (
    assignmentBins: Receiver[][],
    quantifierPool: Quantifier[],
  ): Assignments => {
    // Convert array of quantifiers to a single object, keyed by _id
    const quantifierPoolById = quantifierPool.reduce<QuantifierPoolById>(
      (poolById, q) => {
        poolById[q._id] = q;
        return poolById;
      },
      {},
    );

    // Assign each quantifier to an available bin
    //  or Assign each bin to an available quantifier
    const availableQuantifiers = [...quantifierPool];
    const availableBins = [...assignmentBins];

    const skippedAssignmentBins: Receiver[][] = [];
    const skippedAssignmentOptionIds: string[] = [];

    while (availableBins.length > 0) {
      const assignmentBin: Receiver[] | undefined = availableBins.pop();
      if (!assignmentBin) continue;

      if (availableQuantifiers.length === 0) {
        skippedAssignmentBins.push(assignmentBin);
        continue;
      }

      const q = availableQuantifiers.pop();

      if (!q) throw Error('Failed to generate assignments');

      // Generate a unique id to reference this assignment option (bin + quantifier)
      const assignmentBinId: string = flatten(
        assignmentBin.map((r: Receiver) => r.praiseIds),
      ).join('+');
      const assignmentOptionId = `${q._id.toString()}-${assignmentBinId}`;

      const qUserAccountIds: string[] = q.accounts.map((account: UserAccount) =>
        account._id.toString(),
      );
      const assignmentReceiverIds: string[] = assignmentBin.map((r: Receiver) =>
        r._id.toString(),
      );

      // Confirm none of the Receivers in the assignment bin belong to the Quantifier
      const overlappingUserAccounts = intersection(
        qUserAccountIds,
        assignmentReceiverIds,
      );
      if (overlappingUserAccounts.length === 0) {
        // assign Quantifier to original pool
        quantifierPoolById[q._id.toString()].receivers.push(...assignmentBin);
      } else if (skippedAssignmentOptionIds.includes(assignmentOptionId)) {
        // this assignment option has been skipped before
        //  mark it as un-assignable by the current quantiifer set
        skippedAssignmentBins.push(assignmentBin);
      } else {
        // this assignment option has not been skipped yet
        // make quantifier available again, at end of the line
        availableQuantifiers.unshift(q);

        // make bin available again, at the beginning of the line
        availableBins.push(assignmentBin);

        // note that this assignment option has been skipped once
        skippedAssignmentOptionIds.push(assignmentOptionId);
      }
    }

    // Convert object of quantifiers back to array & remove any unassigned
    const poolAssignments: Quantifier[] = Object.values<Quantifier>(
      quantifierPoolById,
    ).filter((q: Quantifier): boolean => q.receivers.length > 0);

    const remainingPraiseCount = sum(
      flatten(
        skippedAssignmentBins.map((bin) =>
          bin.map((receiver) => receiver.praiseIds.length),
        ),
      ),
    );

    return {
      poolAssignments,
      remainingAssignmentsCount: skippedAssignmentBins.length,
      remainingPraiseCount,
    };
  };

  /**
   * Verify & log that all praise is accounted for in this model
   *
   * @param period
   * @param PRAISE_QUANTIFIERS_PER_PRAISE_RECEIVER
   * @param assignments
   */
  verifyAssignments = async (
    period: Period,
    PRAISE_QUANTIFIERS_PER_PRAISE_RECEIVER: number,
    assignments: Assignments,
  ): Promise<void> => {
    const previousPeriodEndDate = await this.getPreviousPeriodEndDate(period);

    const totalPraiseCount: number = await PraiseModel.count({
      createdAt: { $gt: previousPeriodEndDate, $lte: period.endDate },
    });
    const expectedAccountedPraiseCount: number =
      totalPraiseCount * PRAISE_QUANTIFIERS_PER_PRAISE_RECEIVER;

    const assignedPraiseCount = sum(
      flatten(
        assignments.poolAssignments.map((q: Quantifier) =>
          q.receivers.map((r: Receiver) => r.praiseIds.length),
        ),
      ),
    );

    const accountedPraiseCount =
      assignedPraiseCount + assignments.remainingPraiseCount;

    if (accountedPraiseCount === expectedAccountedPraiseCount) {
      await this.eventLogService.logEvent({
        typeKey: EventLogTypeKey.PERIOD,
        description: `All redundant praise assignments accounted for: ${accountedPraiseCount} / ${expectedAccountedPraiseCount} expected in period`,
      });
    } else {
      throw new ServiceException(
        `Not all redundant praise assignments accounted for: ${accountedPraiseCount} / ${expectedAccountedPraiseCount} expected in period`,
      );
    }

    const verifiedUniqueAssignments = assignments.poolAssignments.map(
      (quantifier) =>
        quantifier.receivers.length ===
        new Set(quantifier.receivers.map((r) => r._id.toString())).size,
    );

    if (every(verifiedUniqueAssignments)) {
      await this.eventLogService.logEvent({
        typeKey: EventLogTypeKey.PERIOD,
        description: `All redundant praise are assigned to unique quantifiers`,
      });
    } else {
      throw new ServiceException(
        'Some redundant praise are assigned to the same quantifier multiple times',
      );
    }
  };

  /**
   * Apply a bin-packing algorithm to
   *  fit differently-sized collections of praise (i.e. all praise given to a single receiver)
   *  into a variable number of "bins" (i.e. quantifiers),
   *  targeting a specified number of praise assigned to each quantifiers
   *
   *  See https://en.wikipedia.org/wiki/Bin_packing_problem
   *
   * @param period
   * @param PRAISE_QUANTIFIERS_PER_PRAISE_RECEIVER
   * @param targetBinSize
   * @returns
   */
  prepareAssignmentsByTargetPraiseCount = async (
    period: Period,
    PRAISE_QUANTIFIERS_PER_PRAISE_RECEIVER: number,
    targetBinSize: number,
  ): Promise<Assignments> => {
    // Query a list of receivers with their collection of praise
    const receivers: Receiver[] = await this.queryReceiversWithPraise(period);

    // Query the list of quantifiers & randomize order
    const quantifierPool = await this.queryQuantifierPoolRandomized();

    // Clone the list of receivers for each redundant assignment
    //  (as defined by setting PRAISE_QUANTIFIERS_PER_PRAISE_RECEIVER)
    const redundantAssignmentBins: Receiver[][] = flatten(
      range(PRAISE_QUANTIFIERS_PER_PRAISE_RECEIVER).map(() => {
        // Run "first Fit" randomized bin-packing algorithm on list of receivers
        //    with a maximum 'bin' size of: PRAISE_PER_QUANTIFIER
        //    where each item takes up bin space based on its' praiseCount
        const receiversShuffled = receivers
          .sort(() => 0.5 - Math.random())
          .slice(0, receivers.length);

        const result: PackingOutput<Receiver> = firstFit(
          receiversShuffled,
          (r: Receiver) => r.praiseCount,
          targetBinSize,
        );

        const bins: Receiver[][] = [
          ...result.bins,
          ...result.oversized.map((r) => [r]),
        ];

        return bins;
      }),
    );

    const assignments = this.generateAssignments(
      redundantAssignmentBins,
      quantifierPool,
    );

    await this.verifyAssignments(
      period,
      PRAISE_QUANTIFIERS_PER_PRAISE_RECEIVER,
      assignments,
    );

    return assignments;
  };

  /**
   * Check if any praise in the given period has already been assigned to quantifiers
   *
   * @param {Period} period
   * @returns {Promise<boolean>}
   */
  isAnyPraiseAssigned = async (period: Period): Promise<boolean> => {
    const periodDateRangeQuery = await this.getPeriodDateRangeQuery(period);

    const praises = await PraiseModel.find({
      createdAt: periodDateRangeQuery,
    });

    const quantifiersPerPraiseReceiver =
      (await this.settingsService.settingValue(
        'PRAISE_QUANTIFIERS_PER_PRAISE_RECEIVER',
        period._id,
      )) as number;

    const praisesAssigned = praises.map(
      (praise) =>
        praise.quantifications.length === quantifiersPerPraiseReceiver,
    );

    return some(praisesAssigned);
  };

  /**
   * Generate object for use in mongoose queries,
   *  to filter by date range of a Period
   *
   * @param {Period} period
   * @returns {Promise<PeriodDateRange>}
   */
  getPeriodDateRangeQuery = async (
    period: Period,
  ): Promise<PeriodDateRangeDto> => ({
    $gt: await this.getPreviousPeriodEndDate(period),
    $lte: period.endDate,
  });
}
