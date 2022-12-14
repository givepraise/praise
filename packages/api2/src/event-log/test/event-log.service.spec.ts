import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../../app.module';
import { EventLogModule } from '../event-log.module';
import { EventLogService } from '../event-log.service';

describe('EventLogService', () => {
  let service: EventLogService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule, EventLogModule],
      // TODO: AppModule is imported to get the database connection, should instead use a mock database
    }).compile();

    service = module.get<EventLogService>(EventLogService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
