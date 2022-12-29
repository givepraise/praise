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
import { PaginationModel } from 'mongoose-paginate-ts';
import { FindAllPaginatedQuery } from './dto/find-all-paginated-query.dto';
import { ServiceException } from '@/shared/service-exception';
import { CreateEventLogDto } from './dto/create-event-log.dto';
import { RequestContext } from 'nestjs-request-context';
import { RequestWithAuthContext } from '@/auth/interfaces/request-with-user.interface';
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
  getModel(): Model<EventLogDocument> {
    return this.eventLogModel;
  }

  /**
   * Convenience method to get the EventLogType Model
   * @returns
   */
  getTypeModel(): Model<EventLogTypeDocument> {
    return this.eventLogTypeModel;
  }

  async logEvent(createEventLogDto: CreateEventLogDto): Promise<EventLog> {
    const { typeKey } = createEventLogDto;
    const type = await this.eventLogTypeModel
      .findOne({ key: typeKey.toString() })
      .lean()
      .orFail();

    const req: RequestWithAuthContext = RequestContext.currentContext.req;

    const eventLogData = {
      user: req.user?.userId,
      apiKey: req.user?.apiKeyId,
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
    options: FindAllPaginatedQuery,
  ): Promise<PaginationModel<EventLog>> {
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
    };

    const response = await this.eventLogModel.paginate(paginateQuery);
    if (!response) throw new ServiceException('Failed to query event logs');

    return {
      ...response,
      docs: response.docs.map((item) => new EventLog(item)),
    };
  }

  async findTypes(): Promise<EventLogType[]> {
    return this.eventLogTypeModel.find();
  }
}
