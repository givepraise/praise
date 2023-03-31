import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PeriodsController } from './periods.controller';
import { Period, PeriodSchema } from './schemas/periods.schema';
import { EventLogModule } from '../event-log/event-log.module';
import { PraiseModule } from '../praise/praise.module';
import { Praise, PraiseSchema } from '../praise/schemas/praise.schema';
import { SettingsModule } from '../settings/settings.module';
import {
  UserAccount,
  UserAccountSchema,
} from '../useraccounts/schemas/useraccounts.schema';
import { User, UserSchema } from '../users/schemas/users.schema';
import { PeriodAssignmentsService } from './services/period-assignments.service';
import { PeriodsService } from './services/periods.service';
import {
  Quantification,
  QuantificationsSchema,
} from '../quantifications/schemas/quantifications.schema';
import { ConstantsProvider } from '../constants/constants.provider';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Period.name, schema: PeriodSchema },
      { name: Praise.name, schema: PraiseSchema },
      { name: UserAccount.name, schema: UserAccountSchema },
      { name: User.name, schema: UserSchema },
      { name: Quantification.name, schema: QuantificationsSchema },
    ]),
    EventLogModule,
    SettingsModule,
    PraiseModule,
  ],
  controllers: [PeriodsController],
  providers: [PeriodsService, PeriodAssignmentsService, ConstantsProvider],
  exports: [PeriodsService],
})
export class PeriodsModule {}
