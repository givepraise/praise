import { Test, TestingModule } from '@nestjs/testing';
import { PeriodsettingsController } from './periodsettings.controller';
import { PeriodsettingsService } from './periodsettings.service';

describe('PeriodsettingsController', () => {
  let controller: PeriodsettingsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PeriodsettingsController],
      providers: [PeriodsettingsService],
    }).compile();

    controller = module.get<PeriodsettingsController>(PeriodsettingsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
