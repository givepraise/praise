import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PraiseController } from './praise.controller';
import { PraiseService } from './services/praise.service';
import { Praise, PraiseSchema } from './schemas/praise.schema';
import { SettingsModule } from '../settings/settings.module';
import { EventLogModule } from '../event-log/event-log.module';
import { PraiseExportService } from './services/praise-export.service';
import { ConstantsProvider } from '../constants/constants.provider';
import { Period, PeriodSchema } from '../periods/schemas/periods.schema';
import {
  UserAccount,
  UserAccountSchema,
} from '../useraccounts/schemas/useraccounts.schema';
import { User, UserSchema } from '../users/schemas/users.schema';
import {
  Quantification,
  QuantificationsSchema,
} from '../quantifications/schemas/quantifications.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Praise.name, schema: PraiseSchema },
      { name: Period.name, schema: PeriodSchema },
      { name: UserAccount.name, schema: UserAccountSchema },
      { name: User.name, schema: UserSchema },
      { name: Quantification.name, schema: QuantificationsSchema },
    ]),
    SettingsModule,
    EventLogModule,
  ],
  controllers: [PraiseController],
  providers: [PraiseService, PraiseExportService, ConstantsProvider],
  exports: [PraiseService],
})
export class PraiseModule {}
