import { AuthRole } from '../../auth/enums/auth-role.enum';
import { EventLogTypeKey } from '../../event-log/enums/event-log-type-key';
import { EventLogService } from '../../event-log/event-log.service';
import { Quantifier } from '../../praise/interfaces/quantifier.interface';
import { Receiver } from '../../praise/interfaces/receiver.interface';
import { Praise, PraiseModel } from '../../praise/schemas/praise.schema';
import { Quantification } from '../../quantifications/schemas/quantifications.schema';
import { SettingsService } from '../../settings/settings.service';
import { ServiceException } from '../../shared/exceptions/service-exception';
import { UserAccount } from '../../useraccounts/schemas/useraccounts.schema';
import { User } from '../../users/schemas/users.schema';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import flatten from 'lodash/flatten';
import intersection from 'lodash/intersection';
import range from 'lodash/range';
import sum from 'lodash/sum';
import zip from 'lodash/zip';
import every from 'lodash/every';
import some from 'lodash/some';
import { firstFit, PackingOutput } from 'bin-packer';
import greedyPartitioning from 'greedy-number-partitioning';
import { AssignmentsDto } from '../dto/assignments.dto';
import { PeriodDateRangeDto } from '../dto/period-date-range.dto';
import { PeriodDetailsDto } from '../dto/period-details.dto';
import { ReplaceQuantifierInputDto } from '../dto/replace-quantifier-input.dto';
import { ReplaceQuantifierResponseDto } from '../dto/replace-quantifier-response.dto';
import { VerifyQuantifierPoolSizeDto } from '../dto/verify-quantifiers-pool-size.dto';
import { PeriodStatusType } from '../enums/status-type.enum';
import { QuantifierPoolById } from '../interfaces/quantifier-pool-by-id.interface';
import { Period, PeriodModel } from '../schemas/periods.schema';
import { PeriodsService } from './periods.service';
import { errorMessages } from '../../utils/errorMessages';

@Injectable()
export class PeriodAssignmentsService {
  constructor(
    @InjectModel(Period.name)
    private periodModel: typeof PeriodModel,
    @InjectModel(Praise.name)
    private praiseModel: typeof PraiseModel,
    @InjectModel(User.name)
    private userModel: Model<User>,
    @InjectModel(UserAccount.name)
    private userAccountModel: typeof Model<UserAccount>,
    @InjectModel(Quantification.name)
    private quantificationModel: Model<Quantification>,
    private settingsService: SettingsService,
    private eventLogService: EventLogService,
    private periodsService: PeriodsService,
  ) {}

  /**
   * Return quantifier pool size and needed quantifier pool size
   * @param {Period} period
   * @returns {Promise<boolean>}
   * */
  verifyQuantifierPoolSize = async (
    _id: Types.ObjectId,
  ): Promise<VerifyQuantifierPoolSizeDto> => {
    const period = await this.periodsService.findOneById(_id);

    const PRAISE_QUANTIFIERS_ASSIGN_EVENLY: boolean = JSON.parse(
      (await this.settingsService.settingValue(
        'PRAISE_QUANTIFIERS_ASSIGN_EVENLY',
        period._id,
      )) as string,
    );

    const quantifierPoolSize = await this.userModel.count({
      roles: AuthRole.QUANTIFIER,
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

  /**
   * Assign quantifiers to period
   * @param {Period} period
   * @returns {Promise<AssignmentsDto>}
   **/
  assignQuantifiers = async (
    _id: Types.ObjectId,
  ): Promise<PeriodDetailsDto> => {
    const period = await this.periodsService.findOneById(_id);

    // Check if the period has ended
    const now = Date.now();
    const periodEnd = new Date(period.endDate).getTime();
    if (now < periodEnd)
      throw new ServiceException(
        errorMessages.CANT_ASSIGN_QUANTIFIERS_FOR_A_PERIOD_THAT_HAS_NOT_ENDED,
      );

    if (period.status !== 'OPEN')
      throw new ServiceException(
        errorMessages.QUANTIFIERS_CAN_ONLY_BE_ASSIGNED_ON_OPEN_PERIODS,
      );

    const anyPraiseAssigned = await this.isAnyPraiseAssigned(period);
    if (anyPraiseAssigned)
      throw new ServiceException(
        errorMessages.SOME_PERIODS_HAS_ALREADY_BEEN_ASSIGNED_FOR_THIS_PERIOD,
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
      throw new ServiceException(errorMessages.FAILED_TO_ASSIGN_QUANTIFIERS);
    }

    if (assignedQuantifiers.remainingAssignmentsCount > 0) {
      throw new ServiceException(
        errorMessages.FAILED_TO_ASSIGN_COLLECTION_OF_PRAISE_TO_QUANTIFIERS,
        `Failed to assign ${assignedQuantifiers.remainingAssignmentsCount} collection of praise to a quantifier`,
      );
    }

    try {
      // Generate list of db queries to insert quantifications
      const insertManyQuantifications = flatten(
        assignedQuantifiers.poolAssignments.map((q) =>
          q.receivers.map((receiver) =>
            this.quantificationModel.insertMany(
              receiver.praiseIds.map((praiseId) => ({
                praise: praiseId,
                quantifier: q._id,
              })),
            ),
          ),
        ),
      );
      // Execute all db queries
      await Promise.all(insertManyQuantifications);
    } catch (e) {
      await this.eventLogService.logEvent({
        typeKey: EventLogTypeKey.PERIOD,
        description: `Failed to assign random quantifiers to all praise in period "${period.name}", retrying...`,
      });
    }

    await this.periodModel.updateOne(
      { _id: period._id },
      { $set: { status: PeriodStatusType.QUANTIFY } },
    );

    await this.eventLogService.logEvent({
      typeKey: EventLogTypeKey.PERIOD,
      description: `Assigned random quantifiers to all praise in period "${period.name}"`,
    });

    return await this.periodsService.findPeriodDetails(period._id);
  };

  /**
   * Replace a quantifier with another quantifier
   *
   * @param {Period} period
   * @param {string} currentQuantifierId
   * @param {string} newQuantifierId
   * @returns {Promise<ReplaceQuantifierResponseDto>}
   **/
  replaceQuantifier = async (
    _id: Types.ObjectId,
    replaceQuantifierInputDto: ReplaceQuantifierInputDto,
  ): Promise<ReplaceQuantifierResponseDto> => {
    const { currentQuantifierId, newQuantifierId } = replaceQuantifierInputDto;

    const period = await this.periodsService.findOneById(_id);

    if (period.status !== 'QUANTIFY')
      throw new ServiceException(
        errorMessages.QUANTIFIERS_CAN_ONLY_BE_REPLACED_ON_PERIODS_WITH_STATUS_QUANTIFY,
      );

    if (!currentQuantifierId || !newQuantifierId)
      throw new ServiceException(
        errorMessages.BOTH_CURRENT_QUANTIFIER_ID_AND_NEW_QUANTIFIER_ID_MUST_BE_SPECIFIED,
      );

    if (currentQuantifierId === newQuantifierId)
      throw new ServiceException(
        errorMessages.CANT_REPLACE_A_QUANTIFIER_WITH_THEMSELVES,
      );

    const currentQuantifier = await this.userModel.findById(
      currentQuantifierId,
    );
    if (!currentQuantifier)
      throw new ServiceException(errorMessages.CURRENT_QUANTIFIER_DOESNT_EXIST);

    const newQuantifier = await this.userModel.findById(newQuantifierId);
    if (!newQuantifier)
      throw new ServiceException(
        errorMessages.REPLACEMENT_QUANTIFIER_DOESNT_EXIST,
      );

    if (!newQuantifier.roles.includes(AuthRole.QUANTIFIER))
      throw new ServiceException(
        errorMessages.REPLACEMENT_QUANTIFIER_DOESNT_HAVE_ROLE_QUANTIFIER,
      );

    const dateRangeQuery = await this.getPeriodDateRangeQuery(period);

    const praiseItemsInPeriod = await this.periodsService.findAllPraise(
      period._id,
    );
    const praiseIds = praiseItemsInPeriod.map((p) => p._id);

    const praiseQuantificationsAlreadyAssignedToNewQuantifier =
      await this.quantificationModel.find({
        praise: { $in: praiseIds },
        quantifier: newQuantifierId,
      });

    if (praiseQuantificationsAlreadyAssignedToNewQuantifier?.length > 0)
      throw new ServiceException(
        errorMessages.REPLACEMENT_QUANTIFIER_IS_ALREADY_ASSIGNED_TO_SOME_OF_THE_ORIGINAL_QUANTIFIER,
      );

    const originalQuantifierQuantifications = await this.quantificationModel
      .find({
        quantifier: new Types.ObjectId(currentQuantifierId),
      })
      .lean();

    const originalQuantifierQuantificationPraiseIds =
      originalQuantifierQuantifications.map((q) => q.praise);

    const affectedPraiseIds = await this.praiseModel
      .find({
        // Praise within time period
        createdAt: dateRangeQuery,
        _id: { $in: originalQuantifierQuantificationPraiseIds },
      })
      .lean();

    const newQuantifierAccounts = await this.userAccountModel
      .find({
        user: new Types.ObjectId(newQuantifierId),
      })
      .lean();

    if (newQuantifierAccounts) {
      affectedPraiseIds.find((p) => {
        for (const ua of newQuantifierAccounts) {
          /**
           * TODO: Test if receiver is always ObjectId
           */
          if (ua._id.equals(p.receiver as Types.ObjectId)) {
            throw new ServiceException(
              errorMessages.QUANTIFIERS_CANT_BE_ASSIGNED_TO_QUANTIFY_THEIR_PRAISE,
            );
          }
        }
      });
    }

    const quantificationsToUpdate = await this.quantificationModel
      .find({
        // Quantification within time period
        createdAt: dateRangeQuery,
        // Original quantifier
        quantifier: new Types.ObjectId(currentQuantifierId),
      })
      .lean();

    // Update quantifications
    await this.quantificationModel.updateMany(
      {
        _id: { $in: quantificationsToUpdate.map((q) => q._id) },
      },
      {
        $set: {
          // Reset score
          score: 0,
          dismissed: false,

          // Assign new quantifier
          quantifier: new Types.ObjectId(newQuantifierId),
        },
        $unset: {
          duplicatePraise: 1,
        },
      },
    );

    // Update praise scores
    await this.praiseModel.updateMany(
      {
        _id: { $in: quantificationsToUpdate.map((q) => q.praise) },
      },
      {
        $set: {
          score: 0,
        },
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

    const periodDetailsDto = await this.periodsService.findPeriodDetails(_id);

    return {
      period: periodDetailsDto,
      praises: updatedPraises,
    };
  };

  /**
   * Assigns quantifiers to all praise in a period (dry run)
   * @param _id Period ID
   * @returns Assignments
   */
  assignQuantifiersDryRun = async (
    _id: Types.ObjectId,
  ): Promise<AssignmentsDto> => {
    const period = await this.periodsService.findOneById(_id);

    const PRAISE_QUANTIFIERS_ASSIGN_EVENLY: boolean = JSON.parse(
      (await this.settingsService.settingValue(
        'PRAISE_QUANTIFIERS_ASSIGN_EVENLY',
        period._id,
      )) as string,
    );

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

  /**
   * Prepare assignments by evenly distributing praise to quantifiers
   * @param period Period
   * @param PRAISE_QUANTIFIERS_PER_PRAISE_RECEIVER Number of quantifiers per praise receiver
   * @returns Assignments
   */
  prepareAssignmentsEvenly = async (
    period: Period,
    PRAISE_QUANTIFIERS_PER_PRAISE_RECEIVER: number,
  ): Promise<AssignmentsDto> => {
    // Query a list of receivers with their collection of praise
    const receivers: Receiver[] = await this.queryReceiversWithPraise(period);

    // Query the list of quantifiers & randomize order
    const quantifierPool = await this.queryQuantifierPoolRandomized();

    // When only one quantifier is available, check if that quantifier is also a receiver. If so, throw an ServiceException.
    if (quantifierPool.length === 1) {
      const quantifierIsReceiver = receivers.find((r) =>
        quantifierPool[0].accounts.find((a) => a._id.equals(r._id)),
      );
      if (quantifierIsReceiver) {
        throw new ServiceException(
          errorMessages.THERE_IS_JUST_ONE_QUANTIFIER_THAT_IS_ALSO_RECEIVER,
        );
      }
    }

    // Check that there are more quantifiers in the pool than redundant praise to be assigned
    //  otherwise a quantifier could be assigned the same praise multiple times
    if (PRAISE_QUANTIFIERS_PER_PRAISE_RECEIVER > quantifierPool.length)
      throw new ServiceException(
        errorMessages.UNABLE_TO_ASSIGN_REDUNDANT_QUANTIFICATION_WITHOUT_MORE_MEMBERS_IN_QUANTIFIER_POOL,
      );

    // Check that the number of redundant assignments is greater than to the number of receivers
    //    otherwise a quantifier could be assigned the same praise multiple times
    if (PRAISE_QUANTIFIERS_PER_PRAISE_RECEIVER > receivers.length)
      throw new ServiceException(
        errorMessages.QUANTIFIERS_PER_RECEIVER_IS_TOO_LARGE_FOR_THE_NUMBER_OF_RECEIVERS,
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
            throw new ServiceException(
              errorMessages.FAILED_TO_GENERATE_LIST_OF_REDUNDANT_SHUFFLED_RECEIVERS,
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
    const previousPeriodEndDate =
      await this.periodsService.getPreviousPeriodEndDate(period);

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
      { $match: { roles: AuthRole.QUANTIFIER } },
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
  ): AssignmentsDto => {
    // Convert array of quantifiers to a single object, keyed by _id
    const quantifierPoolById = quantifierPool.reduce<QuantifierPoolById>(
      (poolById, q) => {
        poolById[q._id.toString()] = q;
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

      if (!q)
        throw new ServiceException(
          errorMessages.FAILED_TO_GENERATE_ASSIGNMENTS,
        );

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
    assignments: AssignmentsDto,
  ): Promise<void> => {
    const previousPeriodEndDate =
      await this.periodsService.getPreviousPeriodEndDate(period);

    const totalPraiseCount: number = await this.praiseModel.count({
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
        errorMessages.NOT_ALL_REDUNDANT_PRAISE_ASSIGNMENTS_ACCOUNTED,
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
        errorMessages.SOME_REDUNDANT_PRAISE_ARE_ASSIGNED_TO_THE_SAME_QUANTIFIER_MULTIPLE_TIMES,
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
  ): Promise<AssignmentsDto> => {
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

    const praises = await this.praiseModel
      .find({
        createdAt: periodDateRangeQuery,
      })
      .populate('quantifications');

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
    $gt: await this.periodsService.getPreviousPeriodEndDate(period),
    $lte: period.endDate,
  });
}
