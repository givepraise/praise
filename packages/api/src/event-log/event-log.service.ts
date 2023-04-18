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
import { User } from '../users/schemas/users.schema';
import { EventLogPaginatedResponseDto } from './dto/event-log-pagination-model.dto';
import { errorMessages } from '../shared/exceptions/error-messages';
import { PaginateModel } from '../shared/interfaces/paginate-model.interface';
import { UserAccount } from '../useraccounts/schemas/useraccounts.schema';
import { CreateEventLogWithAuthContextInputDto } from './dto/create-event-log-with-auth-context-input.dto';
import { logger } from '../shared/logger';

@Injectable()
export class EventLogService {
  constructor(
    @InjectModel(EventLog.name)
    private eventLogModel: PaginateModel<EventLog>,
    @InjectModel(EventLogType.name)
    private eventLogTypeModel: Model<EventLogTypeDocument>,
    @InjectModel(UserAccount.name)
    private userAccountModel: Model<EventLogTypeDocument>,
    @InjectModel(User.name)
    private userModel: Model<EventLogTypeDocument>,
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

    logger.info(
      `Logging event: ${JSON.stringify(
        createEventLogDto,
      )}, typeKey: "${typeKey}", and description "${
        createEventLogDto.description
      }" `,
    );

    return new this.eventLogModel({
      ...createEventLogDto,
      type: type._id,
    }).save();
  }

  async logEventWithAuthContext(input: CreateEventLogWithAuthContextInputDto) {
    const { authContext, typeKey, description } = input;
    const { userId, apiKeyId } = authContext;

    logger.info(
      `Logging event with auth context: ${JSON.stringify(
        input,
      )}, typeKey: "${typeKey}", and description "${description}" `,
    );

    return this.logEvent({
      user: userId ? new mongoose.Types.ObjectId(userId) : undefined,
      apiKey: apiKeyId ? new mongoose.Types.ObjectId(apiKeyId) : undefined,
      typeKey,
      description,
    });
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
          path: 'user',
          model: this.userModel,
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
