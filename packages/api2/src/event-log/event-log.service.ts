import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateEventLogDto } from './dto/create-event-log.dto';
import {
  EventLogType,
  EventLogTypeDocument,
} from './entities/event-log-type.entity';
import { EventLog, EventLogModel } from './entities/event-log.entity';
import { isString } from 'lodash';
import mongoose from 'mongoose';
import { Request, Response } from 'express';
import { EventLogInput } from './interfaces';
import { getQuerySort } from '@/shared/util';
import { Pagination } from 'mongoose-paginate-ts';
import {
  eventLogListTransformer,
  eventLogTypeListTransformer,
} from './transformers';

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

  async findAll(req: Request, res: Response) {
    if (!req.query.limit || !req.query.page)
      throw new BadRequestException('limit and page are required');

    const query: EventLogInput = {};
    if (isString(req.query.type)) {
      const typesArray = req.query.type.split(',');
      const types = await this.eventLogTypeModel.find({
        key: { $in: typesArray },
      });
      query.type = types.map((item) => new mongoose.Types.ObjectId(item.id));
    }

    if (isString(req.query.search) && req.query.search.length > 0) {
      query.description = {
        $regex: `${req.query.search}`,
        $options: 'i',
      };
    }

    const paginateQuery = {
      query,
      limit: parseInt(req.query.limit as string),
      page: parseInt(req.query.page),
      sort: getQuerySort(req.query),
    };

    const response = await this.eventLogModel.paginate(paginateQuery);

    if (!response) throw new BadRequestException('Failed to query event logs');

    const docs = response.docs ? response.docs : [];
    const docsTransfomed = await eventLogListTransformer(
      docs,
      res.locals.currentUser.roles,
    );

    res.status(200).json({
      ...response,
      docs: docsTransfomed,
    });
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
