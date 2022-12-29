import { SettingsModule } from '@/settings/settings.module';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { QuantificationsService } from './quantifications.service';
import {
  Quantification,
  QuantificationsSchema,
} from './schemas/quantifications.schema';
import { UserAccountsModule } from '@/useraccounts/useraccounts.module';
import { PeriodsModule } from '@/periods/periods.module';
import { PeriodsService } from '@/periods/periods.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Quantification.name, schema: QuantificationsSchema },
    ]),
    SettingsModule,
    PeriodsModule,
    UserAccountsModule,
  ],
  providers: [QuantificationsService, PeriodsService],
  exports: [QuantificationsService],
})
export class QuantificationsModule {}
