import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PeriodsController } from './periods.controller';
import { Period, PeriodSchema } from './schemas/periods.schema';
import { EventLogModule } from '../event-log/event-log.module';
import { QuantificationsModule } from '@/quantifications/quantifications.module';
import { SettingsModule } from '@/settings/settings.module';
import { PeriodAssignmentsService } from './services/period-assignments.service';
import {
  UserAccount,
  UserAccountSchema,
} from '@/useraccounts/schemas/useraccounts.schema';
import { User, UserSchema } from '@/users/schemas/users.schema';
import { PeriodsService } from './services/periods.service';
import { Praise, PraiseSchema } from '@/praise/schemas/praise.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Period.name, schema: PeriodSchema }]),
    MongooseModule.forFeature([
      { name: UserAccount.name, schema: UserAccountSchema },
    ]),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    MongooseModule.forFeature([{ name: Praise.name, schema: PraiseSchema }]),
    EventLogModule,
    forwardRef(() => SettingsModule),
    QuantificationsModule,
  ],
  controllers: [PeriodsController],
  providers: [PeriodsService, PeriodAssignmentsService],
  exports: [
    PeriodsService,
    MongooseModule.forFeature([{ name: Period.name, schema: PeriodSchema }]),
  ],
})
export class PeriodsModule {}
