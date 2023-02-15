import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../../app.module';
import { CommunityController } from '../event-log.controller';
import { CommunityModule } from '../event-log.module';
import { CommunityService } from '../event-log.service';

describe('EventLogController', () => {
  let controller: CommunityController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule, CommunityModule],
      // TODO: AppModule is imported to get the database connection, should instead use a mock database
      controllers: [CommunityController],
      providers: [CommunityService],
    }).compile();

    controller = module.get<CommunityController>(CommunityController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
