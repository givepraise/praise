import { InjectModel } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { PraiseModel, Praise, PraiseDocument } from '../schemas/praise.schema';
import { ServiceException } from '@/shared/exceptions/service-exception';
import { PeriodStatusType } from '@/periods/enums/status-type.enum';
import { SettingsService } from '@/settings/settings.service';
import { QuantificationsService } from '@/quantifications/services/quantifications.service';
import { PraisePaginatedQueryDto } from '../dto/praise-paginated-query.dto';
import { Pagination } from 'mongoose-paginate-ts';
import { EventLogService } from '../../event-log/event-log.service';
import { EventLogTypeKey } from '@/event-log/enums/event-log-type-key';
import { QuantifyInputDto } from '@/praise/dto/quantify-input.dto';
import { RequestContext } from 'nestjs-request-context';
import { RequestWithAuthContext } from '@/auth/interfaces/request-with-auth-context.interface';
import { PraisePaginatedResponseDto } from '../dto/praise-paginated-response.dto';
import { Period, PeriodModel } from '@/periods/schemas/periods.schema';
import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { PeriodDateRangeDto } from '@/periods/dto/period-date-range.dto';
import { PraiseCreateInputDto } from '../dto/praise-create-input.dto';
import { UserAccount } from '@/useraccounts/schemas/useraccounts.schema';
import { UserAccountModel } from '@/database/schemas/useraccount/useraccount.schema';
import { PraiseCreateResponseDto } from '../dto/praise-create-response.dto';
@Injectable()
export class PraiseService {
  constructor(
    @InjectModel(Praise.name)
    private praiseModel: typeof PraiseModel,
    @InjectModel(Period.name)
    private periodModel: typeof PeriodModel,
    @InjectModel(UserAccount.name)
    private userAccountModel: typeof UserAccountModel,
    @Inject(forwardRef(() => SettingsService))
    private settingsService: SettingsService,
    @Inject(forwardRef(() => QuantificationsService))
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
    options: PraisePaginatedQueryDto,
  ): Promise<PraisePaginatedResponseDto> {
    const { sortColumn, sortType, receiver, giver, page, limit } = options;
    const query = {} as any;

    if (receiver) {
      query.receiver = new Types.ObjectId(receiver);
    }

    if (giver) {
      query.giver = new Types.ObjectId(giver);
    }

    const praisePagination = await this.praiseModel.paginate({
      page,
      limit,
      query,
      sort: sortColumn && sortType ? { [sortColumn]: sortType } : undefined,
      populate: [
        {
          path: 'giver',
          populate: { path: 'user' },
        },
        {
          path: 'receiver',
          populate: { path: 'user' },
        },
        {
          path: 'forwarder',
          populate: { path: 'user' },
        },
      ],
    });

    if (!praisePagination)
      throw new ServiceException('Failed to paginate praise data');

    return praisePagination;
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
      .populate([
        {
          path: 'giver',
          populate: { path: 'user' },
        },
        {
          path: 'receiver',
          populate: { path: 'user' },
        },
        {
          path: 'forwarder',
          populate: { path: 'user' },
        },
        'quantifications',
      ])
      .lean();

    if (!praise) throw new ServiceException('Praise item not found.');

    return praise;
  }

  /**
   * Find the lastest added praise
   */
  async findLatest(): Promise<Praise> {
    const praise = await this.praiseModel
      .find()
      .limit(1)
      .sort({ $natural: -1 })
      .lean();
    if (!praise[0]) throw new ServiceException('Praise not found.');
    return praise[0];
  }

  /**
   * Quantify praise item
   *
   * @param id {string}
   * @param bodyParams {QuantifyInputDto}
   * @returns An array of all affected praise items
   * @throws {ServiceException}
   *
   **/
  quantifyPraise = async (
    id: Types.ObjectId,
    params: QuantifyInputDto,
  ): Promise<Praise[]> => {
    const { score, dismissed, duplicatePraise } = params;

    // Get the praise item in question
    const praise = await this.praiseModel
      .findById(id)
      .populate('giver receiver forwarder')
      .lean();
    if (!praise) throw new ServiceException('Praise item not found');

    // Get the period associated with the praise item
    const period = await this.getPraisePeriod(praise);
    if (!period)
      throw new ServiceException('Praise does not have an associated period');

    // Check if the period is in the QUANTIFY status
    if (period.status !== PeriodStatusType.QUANTIFY)
      throw new ServiceException(
        'Period associated with praise does have status QUANTIFY',
      );

    // Check that user is assigned as quantifier for the praise item
    const req: RequestWithAuthContext = RequestContext.currentContext.req;
    const userId = req.user?.userId;
    if (!userId)
      throw new ServiceException('User not found in request context');

    const quantification =
      await this.quantificationsService.findOneByQuantifierAndPraise(
        userId,
        praise._id,
      );
    if (!quantification) {
      throw new ServiceException('User not assigned as quantifier for praise.');
    }

    let eventLogMessage = '';

    // Collect all affected praises (i.e. any praises whose score will change as a result of this change)
    const affectedPraises: Praise[] = [praise];
    const praisesDuplicateOfThis = await this.findDuplicatePraiseItems(
      praise._id,
      userId,
    );
    if (praisesDuplicateOfThis?.length > 0)
      affectedPraises.push(...praisesDuplicateOfThis);

    if (duplicatePraise) {
      // Check that the duplicatePraise is not the same as the praise item
      if (praise._id.equals(duplicatePraise))
        throw new ServiceException('Praise cannot be a duplicate of itself');

      // Find the original praise item
      const dp = await this.praiseModel.findById(duplicatePraise).lean();
      if (!dp) throw new ServiceException('Duplicate praise item not found');

      // Check that this praise item is not already the original of another duplicate
      if (praisesDuplicateOfThis?.length > 0)
        throw new ServiceException(
          'Praise cannot be marked duplicate when it is the original of another duplicate',
        );

      // Check that this praise item does not become the duplicate of another duplicate
      const praisesDuplicateOfAnotherDuplicate =
        await this.findPraisesDuplicateOfAnotherDuplicate(
          new Types.ObjectId(duplicatePraise),
          userId,
        );
      if (praisesDuplicateOfAnotherDuplicate?.length > 0)
        throw new ServiceException(
          'Praise cannot be marked duplicate of another duplicate',
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
        throw new ServiceException(
          'Score, dismissed or duplicatePraise is required',
        );
      }

      // Check if the score is allowed
      const settingAllowedScores = (await this.settingsService.settingValue(
        'PRAISE_QUANTIFY_ALLOWED_VALUES',
        period._id,
      )) as string;

      const allowedScore = settingAllowedScores.split(',').map(Number);

      if (!allowedScore.includes(score)) {
        throw new ServiceException(
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
    await this.quantificationsService.updateQuantification(quantification);

    const docs: Praise[] = [];

    // Update the score of the praise item and all duplicates
    for (const p of affectedPraises) {
      const score =
        await this.quantificationsService.calculateQuantificationsCompositeScore(
          p,
        );

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
      await this.quantificationsService.findByQuantifierAndDuplicatePraiseExist(
        quantifierId,
        true,
      );

    const duplicateArray = duplicateQuantifications.filter(
      (q) => q.praise._id === duplicatePraise,
    );

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
   * Count Praise created within any given date range
   *
   * @param {PeriodDateRange[]} dateRanges
   * @param {object} [match={}]
   * @returns {Promise<number>}
   */
  countPraiseWithinDateRanges = async (
    dateRanges: PeriodDateRangeDto[],
    match: object = {},
  ): Promise<number> => {
    const withinDateRangeQueries: { createdAt: PeriodDateRangeDto }[] =
      dateRanges.map((q) => ({
        createdAt: q,
      }));

    const assignedPraiseCount: number = await this.praiseModel.count({
      $or: withinDateRangeQueries,
      ...match,
    });

    return assignedPraiseCount;
  };

  /**
   * Creates praises with a given receiver and reason
   *  and returns the created praises
   *
   * @param {PraiseCreateInputDto} data
   * @returns {Promise<PraiseCreateResponseDto>}
   * @throws {ServiceException}
   */
  createPraiseItem = async (
    data: PraiseCreateInputDto,
  ): Promise<PraiseCreateResponseDto> => {
    const messages = [];

    const { giver, receiverIds, reason, reasonRaw, sourceId, sourceName } =
      data;

    if (!receiverIds || receiverIds.length === 0) {
      throw new ServiceException('No receivers specified');
    }

    const giverAccount = await this.userAccountModel.findOneAndUpdate(
      { accountId: giver.accountId },
      giver,
      { upsert: true, new: true },
    );

    const praiseItemsCount = await this.praiseModel.countDocuments({
      giver: giverAccount._id,
    });

    if (!giverAccount.user) {
      throw new ServiceException('This praise account is not activated.');
    }

    const selfPraiseAllowed: boolean = JSON.parse(
      (await this.settingsService.settingValue(
        'SELF_PRAISE_ALLOWED',
      )) as string,
    );

    let warnSelfPraise = false;
    if (!selfPraiseAllowed && receiverIds.includes(giverAccount.accountId)) {
      warnSelfPraise = true;
    }

    const receivers = await this.userAccountModel
      .find({
        accountId: { $in: receiverIds },
      })
      .populate('user')
      .lean();

    const praiseItems: Praise[] = [];
    for await (const receiver of receivers) {
      const praiseData = {
        reason: reason,
        reasonRaw: reasonRaw,
        giver: giverAccount._id,
        sourceId: sourceId,
        sourceName: sourceName,
        receiver: receiver._id,
      };

      const praiseItem = await this.praiseModel.create(praiseData);

      if (praiseItem) {
        await this.eventLogService.logEvent({
          typeKey: EventLogTypeKey.PRAISE,
          description: `Praise created: ${praiseItem._id}`,
        });

        praiseItems.push(praiseItem);
      } else {
        await this.eventLogService.logEvent({
          typeKey: EventLogTypeKey.PRAISE,
          description: `Praise not registered for [${giverAccount.accountId}] -> [${receiver.accountId}] for [${reason}]`,
        });
      }
    }

    if (receivers.length !== 0) {
      messages.push(await this.praiseSuccess(receiverIds, reason));
    } else if (warnSelfPraise) {
      messages.push(await this.selfPraiseWarning());
    } else {
      messages.push(await this.invalidReceiverError());
    }

    if (receivers.length && receivers.length !== 0 && praiseItemsCount === 0) {
      messages.push(await this.firstTimePraiserInfo());
    }

    return {
      messages,
      praiseItems,
    };
  };

  /**
   * Generate success response message for commands/praise
   *
   * @param {string[]} praised
   * @param {string} reason
   * @returns {Promise<string>}
   */
  praiseSuccess = async (
    praised: string[],
    reason: string,
  ): Promise<string> => {
    const msg = (await this.settingsService.settingValue(
      'PRAISE_SUCCESS_MESSAGE',
    )) as string;
    if (msg) {
      return msg
        .replace('{@receivers}', `${praised.join(', ')}`)
        .replace('{reason}', reason);
    } else {
      return 'PRAISE SUCCESSFUL (message not set)';
    }
  };

  /**
   * Generate response info message FIRST_TIME_PRAISER
   *
   * @returns {Promise<string>}
   */
  firstTimePraiserInfo = async (): Promise<string> => {
    const msg = (await this.settingsService.settingValue(
      'FIRST_TIME_PRAISER',
    )) as string;
    if (msg) {
      return msg;
    }
    return 'YOU ARE PRAISING FOR THE FIRST TIME. WELCOME TO PRAISE! (message not set)';
  };

  /**
   * Generate response error message SELF_PRAISE_WARNING
   *
   * @returns {Promise<string>}
   */
  selfPraiseWarning = async (): Promise<string> => {
    const msg = (await this.settingsService.settingValue(
      'SELF_PRAISE_WARNING',
    )) as string;
    if (msg) {
      return msg;
    }
    return 'SELF-PRAISE NOT ALLOWED, PRAISE GIVERS UNABLE TO PRAISE THEMSELVES (message not set)';
  };

  /**
   * Generate response error message PRAISE_INVALID_RECEIVERS_ERROR
   *
   * @returns {Promise<string>}
   */
  invalidReceiverError = async (): Promise<string> => {
    const msg = (await this.settingsService.settingValue(
      'PRAISE_INVALID_RECEIVERS_ERROR',
    )) as string;
    if (msg) {
      return msg;
    }
    return 'VALID RECEIVERS NOT MENTIONED (message not set)';
  };
}
