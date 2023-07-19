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
      controllers: [EventLogController],
      providers: [EventLogService],
    }).compile();

    controller = await module.resolve<EventLogController>(EventLogController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
