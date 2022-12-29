import { EventLogService } from '@/event-log/event-log.service';
import { faker } from '@faker-js/faker';
import { Injectable } from '@nestjs/common';
import { EventLogDocument } from '@/event-log/schemas/event-log.schema';
import { UsersSeeder } from './users.seeder';

@Injectable()
export class EventLogSeeder {
  eventLogTypeModel = this.eventLogService.getTypeModel();
  eventLogModel = this.eventLogService.getModel();
  constructor(
    private readonly userSeeder: UsersSeeder,
    private readonly eventLogService: EventLogService,
  ) {}

  /**
   * Generate and save a fake EventLog
   *
   * @param {Object} [eventLogData={}]
   * @returns {Promise<EventLogDocument>}
   */
  seedEventLog = async (
    eventLogData: Record<string, unknown> = {},
  ): Promise<EventLogDocument> => {
    const createdAt = faker.date.recent();
    const randomUser = await this.userSeeder.seedUser();
    const eventLogTypes = await this.eventLogTypeModel.find({});
    const randomEventLogType = eventLogTypes
      .sort(() => 0.5 - Math.random())
      .slice(0, eventLogTypes.length)[0];

    const eventLog = await this.eventLogModel.create({
      user: randomUser._id,
      type: randomEventLogType._id,
      description: faker.lorem.lines(1),
      createdAt,
      updatedAt: createdAt,
      ...eventLogData,
    });

    return eventLog;
  };
}
