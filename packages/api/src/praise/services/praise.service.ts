import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Praise } from '../schemas/praise.schema';
import { ApiException } from '../../shared/exceptions/api-exception';
import { SettingsService } from '../../settings/settings.service';
import { PraisePaginatedQueryDto } from '../dto/praise-paginated-query.dto';
import { PraisePaginatedResponseDto } from '../dto/praise-paginated-response.dto';
import { Period } from '../../periods/schemas/periods.schema';
import { Injectable } from '@nestjs/common';
import { PeriodDateRangeDto } from '../../periods/dto/period-date-range.dto';
import { PraiseCreateInputDto } from '../dto/praise-create-input.dto';
import {
  UserAccount,
  UserAccountDocument,
} from '../../useraccounts/schemas/useraccounts.schema';
import { PraiseForwardInputDto } from '../dto/praise-forward-input.dto';
import { errorMessages } from '../../shared/exceptions/error-messages';
import { PaginateModel } from '../../shared/interfaces/paginate-model.interface';
import { User } from '../../users/schemas/users.schema';

@Injectable()
export class PraiseService {
  constructor(
    @InjectModel(Praise.name)
    private praiseModel: PaginateModel<Praise>,
    @InjectModel(Period.name)
    private periodModel: Model<Period>,
    @InjectModel(UserAccount.name)
    private userAccountModel: Model<UserAccountDocument>,
    @InjectModel(User.name)
    private userModel: Model<User>,
    private settingsService: SettingsService,
  ) {}

  /**
   * Convenience method to get the Praise Model
   * @returns
   */
  getModel(): PaginateModel<Praise> {
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

    const praisePagination = await this.praiseModel.paginate(query, {
      page,
      limit,
      sort: sortColumn && sortType ? { [sortColumn]: sortType } : undefined,
      populate: [
        {
          path: 'giver',
          populate: { path: 'user', model: this.userModel },
        },
        {
          path: 'receiver',
          populate: { path: 'user', model: this.userModel },
        },
        {
          path: 'forwarder',
          populate: { path: 'user', model: this.userModel },
        },
      ],
    });

    if (!praisePagination)
      throw new ApiException(errorMessages.FAILED_TO_PAGINATE_PRAISE_DATA);

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

    if (!praise) throw new ApiException(errorMessages.PRAISE_NOT_FOUND);

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
    if (!praise[0]) throw new ApiException(errorMessages.PRAISE_NOT_FOUND);
    return praise[0];
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
   * Creates praise items with a given receiver and reason
   *  and returns the created praise items
   *
   * @param {PraiseCreateInputDto} data
   * @returns {Promise<Praise[]>}
   * @throws {ServiceException}
   */
  createPraiseItem = async (
    data: PraiseCreateInputDto | PraiseForwardInputDto,
  ): Promise<Praise[]> => {
    let forwarder: UserAccount | undefined;
    const { giver, receiverIds, reason, reasonRaw, sourceId, sourceName } =
      data;

    if ('forwarder' in data) {
      const { forwarder: forwarderFromDto } = data as PraiseForwardInputDto;
      forwarder = forwarderFromDto;
    }

    if (!receiverIds || receiverIds.length === 0) {
      throw new ApiException(errorMessages.NO_RECEIVER_SPECIFIED);
    }

    const giverAccount = await this.userAccountModel.findOneAndUpdate(
      { accountId: giver.accountId },
      giver,
      { upsert: true, new: true },
    );

    if (!giverAccount.user) {
      throw new ApiException(
        errorMessages.PRAISE_GIVER_ACCOUNT_IS_NOT_ACTIVATED,
      );
    }

    if (forwarder) {
      const forwarderAccount = await this.userAccountModel.findOneAndUpdate(
        { accountId: forwarder.accountId },
        forwarder,
        { upsert: true, new: true },
      );

      if (!forwarderAccount.user) {
        throw new ApiException(errorMessages.PRAISE_FORWARDED_IS_NOT_ACTIVATED);
      }
    }

    const selfPraiseAllowed = (
      await this.settingsService.findOneByKey('SELF_PRAISE_ALLOWED')
    )?.valueRealized;

    if (!selfPraiseAllowed && receiverIds.includes(giverAccount.accountId)) {
      throw new ApiException(errorMessages.SELF_PRAISE_IS_NOT_ALLOWED);
    }

    const receivers = await this.userAccountModel
      .find({
        accountId: { $in: receiverIds },
      })
      .populate('user')
      .lean();

    const insertManyPraiseItems = await this.praiseModel.insertMany(
      receivers.map((receiver) => ({
        reason,
        reasonRaw,
        giver: giverAccount._id,
        forwarder: forwarder ? forwarder._id : undefined,
        sourceId,
        sourceName,
        receiver: receiver._id,
      })),
    );

    return await Promise.all(insertManyPraiseItems);
  };
}
