import { Test, TestingModule } from '@nestjs/testing';
import { EventLogController } from '../event-log.controller';
import { EventLogService } from '../event-log.service';

describe('EventLogController', () => {
  let controller: EventLogController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EventLogController],
      providers: [EventLogService],
    }).compile();

    controller = module.get<EventLogController>(EventLogController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
