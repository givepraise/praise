import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PeriodsController } from './periods.controller';
import { Period, PeriodSchema } from './schemas/periods.schema';
import { EventLogModule } from '../event-log/event-log.module';
import { QuantificationsModule } from '../quantifications/quantifications.module';
import { PeriodSettingsModule } from '../periodsettings/periodsettings.module';
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
import { Quantification } from '../quantifications/schemas/quantifications.schema';
import { QuantificationSchema } from '../database/schemas/quantification/quantification.schema';
import { ApiKeyModule } from '../api-key/api-key.module';
import { AuthModule } from '../auth/auth.module';
import { ConstantsProvider } from '../constants/constants.provider';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Period.name, schema: PeriodSchema }]),
    MongooseModule.forFeature([
      { name: UserAccount.name, schema: UserAccountSchema },
    ]),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    MongooseModule.forFeature([{ name: Praise.name, schema: PraiseSchema }]),
    MongooseModule.forFeature([
      { name: Quantification.name, schema: QuantificationSchema },
    ]),
    forwardRef(() => EventLogModule),
    forwardRef(() => SettingsModule),
    forwardRef(() => PeriodSettingsModule),
    forwardRef(() => PraiseModule),
    forwardRef(() => QuantificationsModule),
    forwardRef(() => AuthModule),
    ApiKeyModule,
  ],
  controllers: [PeriodsController],
  providers: [PeriodsService, PeriodAssignmentsService, ConstantsProvider],
  exports: [
    PeriodsService,
    MongooseModule.forFeature([{ name: Period.name, schema: PeriodSchema }]),
  ],
})
export class PeriodsModule {}
