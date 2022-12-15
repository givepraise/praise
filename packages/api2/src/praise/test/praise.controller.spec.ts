import { PeriodsModule } from '@/periods/periods.module';
import { QuantificationsModule } from '@/quantifications/quantifications.module';
import { SettingsModule } from '@/settings/settings.module';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../../app.module';
import { PraiseController } from '../praise.controller';
import { PraiseModule } from '../praise.module';
import { PraiseService } from '../praise.service';

describe('PraiseController', () => {
  let controller: PraiseController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        AppModule,
        PraiseModule,
        PeriodsModule,
        SettingsModule,
        QuantificationsModule,
      ],
      // TODO: AppModule is imported to get the database connection, should instead use a mock database
      controllers: [PraiseController],
      providers: [PraiseService],
    }).compile();

    controller = module.get<PraiseController>(PraiseController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
