import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../../app.module';
import { CommunityModule } from '../event-log.module';
import { CommunityService } from '../event-log.service';

describe('EventLogService', () => {
  let service: CommunityService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule, CommunityModule],
      // TODO: AppModule is imported to get the database connection, should instead use a mock database
    }).compile();

    service = module.get<CommunityService>(CommunityService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
