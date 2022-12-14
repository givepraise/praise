import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../../app.module';
import { EventLogController } from '../event-log.controller';
import { EventLogModule } from '../event-log.module';
import { EventLogService } from '../event-log.service';

describe('EventLogController', () => {
  let controller: EventLogController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule, EventLogModule],
      // TODO: AppModule is imported to get the database connection, should instead use a mock database
      controllers: [EventLogController],
      providers: [EventLogService],
    }).compile();

    controller = module.get<EventLogController>(EventLogController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
