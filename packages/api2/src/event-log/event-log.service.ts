import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateEventLogDto } from './dto/create-event-log.dto';
import {
  EventLogType,
  EventLogTypeDocument,
} from './entities/event-log-type.entity';
import { EventLog, EventLogModel } from './entities/event-log.entity';
import { isString } from 'lodash';
import mongoose from 'mongoose';
import { Request, Response } from 'express';
import { Pagination } from 'mongoose-paginate-ts';
import {
  eventLogListTransformer,
  eventLogTypeListTransformer,
} from './transformers';
import { PaginationQuery } from '@/shared/dto/pagination-query.dto';
import { FindAllQuery } from './dto/find-all-query.dto';

@Injectable()
export class EventLogService {
  constructor(
    @InjectModel(EventLog.name)
    private eventLogModel: Model<Pagination<EventLogModel>>,
    @InjectModel(EventLogType.name)
    private eventLogTypeModel: Model<EventLogTypeDocument>,
  ) {}

  async logEvent(createEventLogDto: CreateEventLogDto): Promise<void> {
    const { typeKey, description, userInfo, periodId } = createEventLogDto;
    const type = await this.eventLogTypeModel
      .findOne({ key: typeKey.toString() })
      .orFail();

    const data = {
      type: type._id,
      description,
      user: userInfo.userId ? userInfo.userId : undefined,
      useraccount: userInfo.userAccountId ? userInfo.userAccountId : undefined,
      period: periodId,
    };

    await this.eventLogModel.create(data);
  }

  async findAll(options: FindAllQuery) {
    const { page, limit, sortColumn, sortType, search, type } = options;

    let types: Types.ObjectId[] = [];
    if (type.length > 0) {
      const typesArray = type.split(',');
      const t = await this.eventLogTypeModel.find({
        key: { $in: typesArray },
      });
      types = t.map((item) => new mongoose.Types.ObjectId(item.id));
    }

    let description;
    if (search.length > 0) {
      description = {
        $regex: `${search}`,
        $options: 'i',
      };
    }

    // const paginateQuery = {
    //   query: {
    //     type,
    //     description,
    //   },
    //   limit,
    //   page,
    //   sort: getQuerySort(req.query),
    // };

    // const response = await EventLogModel.paginate(paginateQuery);

    // if (!response) throw new BadRequestError('Failed to query event logs');

    // const docs = response.docs ? response.docs : [];
    // const docsTransfomed = await eventLogListTransformer(
    //   docs,
    //   res.locals.currentUser.roles,
    // );

    // res.status(StatusCodes.OK).json({
    //   ...response,
    //   docs: docsTransfomed,
    // });
  }

  async types(req: Request, res: Response) {
    const response = await this.eventLogTypeModel.find();

    if (!response)
      throw new BadRequestException('Failed to query event log types');

    const docsTransfomed = await eventLogTypeListTransformer(response);

    res.status(200).json({
      ...response,
      docs: docsTransfomed,
    });
  }
}
