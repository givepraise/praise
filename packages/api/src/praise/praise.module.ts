import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PraiseController } from './praise.controller';
import { PraiseService } from './services/praise.service';
import { Praise, PraiseSchema } from './schemas/praise.schema';
import { QuantificationsModule } from '../quantifications/quantifications.module';
import { SettingsModule } from '../settings/settings.module';
import { EventLogModule } from '../event-log/event-log.module';
import { Period, PeriodSchema } from '../periods/schemas/periods.schema';
import { PeriodsModule } from '../periods/periods.module';
import { PraiseExportService } from './services/praise-export.service';
import {
  UserAccount,
  UserAccountSchema,
} from '../useraccounts/schemas/useraccounts.schema';
import { ConstantsProvider } from '../constants/constants.provider';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Praise.name, schema: PraiseSchema }]),
    MongooseModule.forFeature([{ name: Period.name, schema: PeriodSchema }]),
    MongooseModule.forFeature([
      { name: UserAccount.name, schema: UserAccountSchema },
    ]),
    PeriodsModule,
    QuantificationsModule,
    SettingsModule,
    EventLogModule,
  ],
  controllers: [PraiseController],
  providers: [PraiseService, PraiseExportService, ConstantsProvider],
  exports: [PraiseService],
})
export class PraiseModule {}
