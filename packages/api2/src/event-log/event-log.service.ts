import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateEventLogDto } from './dto/create-event-log.dto';
import {
  EventLogType,
  EventLogTypeDocument,
} from './entities/event-log-type.entity';
import { EventLog, EventLogDocument } from './entities/event-log.entity';

@Injectable()
export class EventLogService {
  constructor(
    @InjectModel(EventLog.name)
    private eventLogModel: Model<EventLogDocument>,
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

  findAll() {
    return `This action returns all eventLog`;
  }

  findOne(id: number) {
    return `This action returns a #${id} eventLog`;
  }
}
