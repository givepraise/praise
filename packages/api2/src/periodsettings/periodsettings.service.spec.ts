import { Test, TestingModule } from '@nestjs/testing';
import { PeriodsettingsService } from './periodsettings.service';

describe('PeriodsettingsService', () => {
  let service: PeriodsettingsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PeriodsettingsService],
    }).compile();

    service = module.get<PeriodsettingsService>(PeriodsettingsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
