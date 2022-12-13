import { UserRole } from '@/users/interfaces/user-role.interface';
import { User } from '@/users/schemas/users.schema';
import { UsersService } from '@/users/users.service';
import { faker } from '@faker-js/faker';
import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { EventLogTypeDocument } from 'src/event-log/entities/event-log-type.entity';
import { EventLogDocument } from 'src/event-log/entities/event-log.entity';
import { UsersSeeder } from './users.seeder';

@Injectable()
export class EventLogSeeder {
  userModel = this.usersService.getModel();
  constructor(
    private readonly usersService: UsersService,
    private readonly userSeeder: UsersSeeder,
    private eventLogTypeModel: Model<EventLogTypeDocument>,
    private eventLogModel: Model<EventLogDocument>,
  ) {}

  /**
   * Generate and save a fake User
   *
   * @param {Object} [userData={}]
   * @returns {Promise<UserDocument>}
   */
  seedUser = async (userData: unknown): Promise<User> => {
    const user = await this.userModel.create({
      identityEthAddress: faker.finance.ethereumAddress(),
      rewardsEthAddress: faker.finance.ethereumAddress(),
      username: faker.internet.userName(),
      roles: [UserRole.USER],
      ...(userData as any),
    });

    return user;
  };

  /**
   * Generate and save a fake EventLog
   *
   * @param {Object} [eventLogData={}]
   * @returns {Promise<EventLogDocument>}
   */
  seedEventLog = async (
    eventLogData: Object = {},
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
