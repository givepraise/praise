import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../../app.module';
import { EventLogModule } from '../event-log.module';
import { EventLogService } from '../event-log.service';

describe('EventLogService', () => {
  let service: EventLogService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule, EventLogModule],
    }).compile();

    service = module.get<EventLogService>(EventLogService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
