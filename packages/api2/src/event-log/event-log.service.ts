import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  EventLogType,
  EventLogTypeDocument,
} from './schemas/event-log-type.schema';
import {
  EventLog,
  EventLogDocument,
  PaginatedEventLogModel,
} from './schemas/event-log.schema';
import mongoose from 'mongoose';
import { EventLogFindPaginatedQueryDto } from './dto/event-log-find-paginated-query.dto';
import { ServiceException } from '@/shared/service-exception';
import { CreateEventLogInputDto } from './dto/create-event-log-input.dto';
import { RequestContext } from 'nestjs-request-context';
import { has } from 'lodash';
import { User } from '@/users/schemas/users.schema';
import { EventLogPaginatedResponseDto } from './dto/event-log-pagination-model.dto';
@Injectable()
export class EventLogService {
  constructor(
    @InjectModel(EventLog.name)
    private eventLogModel: typeof PaginatedEventLogModel,
    @InjectModel(EventLogType.name)
    private eventLogTypeModel: Model<EventLogTypeDocument>,
  ) {}

  /**
   * Convenience method to get the EventLog Model
   * @returns
   */
  getModel(): Model<EventLog> {
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
    return eventLog.save();
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
    if (Array.isArray(types) && types.length > 0) {
      const t = await this.eventLogTypeModel.find({
        key: { $in: types },
      });
      query.types = t.map((item) => new mongoose.Types.ObjectId(item.id));
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

    const paginateQuery = {
      query,
      limit,
      page,
      sort,
      populate: [
        {
          path: 'type',
        },
      ],
    };

    const eventLogPagination = await this.eventLogModel.paginate(paginateQuery);

    if (!eventLogPagination)
      throw new ServiceException('Failed to query event logs');

    return eventLogPagination;
  }

  async findTypes(): Promise<EventLogType[]> {
    return this.eventLogTypeModel.find().lean();
  }
}
