import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  EventLogType,
  EventLogTypeDocument,
} from './schemas/event-log-type.schema';
import { EventLog } from './schemas/event-log.schema';
import mongoose from 'mongoose';
import { EventLogFindPaginatedQueryDto } from './dto/event-log-find-paginated-query.dto';
import { ApiException } from '../shared/exceptions/api-exception';
import { CreateEventLogInputDto } from './dto/create-event-log-input.dto';
import { RequestContext } from 'nestjs-request-context';
import { has } from 'lodash';
import { User } from '../users/schemas/users.schema';
import { EventLogPaginatedResponseDto } from './dto/event-log-pagination-model.dto';
import { errorMessages } from '../shared/exceptions/error-messages';
import { PaginateModel } from '../shared/interfaces/paginate-model.interface';
import { UserAccount } from '../useraccounts/schemas/useraccounts.schema';

@Injectable()
export class EventLogService {
  constructor(
    @InjectModel(EventLog.name)
    private eventLogModel: PaginateModel<EventLog>,
    @InjectModel(EventLogType.name)
    private eventLogTypeModel: Model<EventLogTypeDocument>,
    @InjectModel(UserAccount.name)
    private userAccountModel: Model<EventLogTypeDocument>,
  ) {}

  /**
   * Convenience method to get the EventLog Model
   * @returns
   */
  getModel(): PaginateModel<EventLog> {
    return this.eventLogModel;
  }

  /**
   * Convenience method to get the EventLogType Model
   * @returns
   */
  getTypeModel(): Model<EventLogTypeDocument> {
    return this.eventLogTypeModel;
  }

  async logEvent(createEventLogDto: CreateEventLogInputDto): Promise<EventLog> {
    const { typeKey } = createEventLogDto;
    const type = await this.eventLogTypeModel
      .findOne({ key: typeKey.toString() })
      .lean()
      .orFail();

    const req = RequestContext.currentContext?.req;

    // Try to get user id from either RequestWithAuthContext or from RequestWithUserContext
    const userId = has(req, 'user._id')
      ? (req.user as User)._id // RequestWithUserContext
      : req?.user?.userId; // RequestWithAuthContext

    const eventLogData = {
      user: userId,
      apiKey: req?.user?.apiKeyId, // RequestWithAuthContext
      ...createEventLogDto,
      type: type._id,
    };

    const eventLog = new this.eventLogModel(eventLogData);
    const eventLogDocument = await eventLog.save();
    return new EventLog(eventLogDocument);
  }

  /**
   * Find all event logs. Paginated.
   * @param options
   * @returns
   */
  async findAllPaginated(
    options: EventLogFindPaginatedQueryDto,
  ): Promise<EventLogPaginatedResponseDto> {
    const { page, limit, sortColumn, sortType, search, types } = options;
    const query = {} as any;

    // Filter by types
    if (Array.isArray(types) && types.length > 0 && types[0]) {
      const t = await this.eventLogTypeModel.find({
        key: { $in: types },
      });
      query.type = t.map((item) => new mongoose.Types.ObjectId(item.id));
    }

    // Search contents of description field
    if (search && search.length > 0) {
      query.description = {
        $regex: `${search}`,
        $options: 'i',
      };
    }

    // Sorting - defaults to descending
    const sort =
      sortColumn && sortType ? { [sortColumn]: sortType } : undefined;

    const eventLogPagination = await this.eventLogModel.paginate(query, {
      limit,
      page,
      sort,
      populate: [
        {
          path: 'type',
        },
        {
          path: 'useraccount',
          model: this.userAccountModel,
        },
      ],
    });

    if (!eventLogPagination)
      throw new ApiException(errorMessages.FAILED_TO_QUERY_EVENT_LOGS);

    return eventLogPagination;
  }

  async findTypes(): Promise<EventLogType[]> {
    return this.eventLogTypeModel.find().lean();
  }
}
