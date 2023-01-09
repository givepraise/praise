import { SettingsModule } from '@/settings/settings.module';
import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { QuantificationsService } from './quantifications.service';
import {
  Quantification,
  QuantificationsSchema,
} from './schemas/quantifications.schema';
import { UserAccountsModule } from '@/useraccounts/useraccounts.module';
import { PeriodsModule } from '@/periods/periods.module';
import { UsersModule } from '@/users/users.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Quantification.name, schema: QuantificationsSchema },
    ]),
    forwardRef(() => SettingsModule),
    forwardRef(() => PeriodsModule),
    UserAccountsModule,
    UsersModule,
  ],
  providers: [QuantificationsService],
  exports: [QuantificationsService],
})
export class QuantificationsModule {}
