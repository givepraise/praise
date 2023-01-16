import { SettingsModule } from '@/settings/settings.module';
import { MongooseModule } from '@nestjs/mongoose';
import { QuantificationsService } from './quantifications.service';
import {
  Quantification,
  QuantificationsSchema,
} from './schemas/quantifications.schema';
import { UserAccountsModule } from '@/useraccounts/useraccounts.module';
import { UsersModule } from '@/users/users.module';
import { PraiseModule } from '@/praise/praise.module';
import { PeriodsModule } from '@/periods/periods.module';
import { Module, forwardRef } from '@nestjs/common';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Quantification.name, schema: QuantificationsSchema },
    ]),
    forwardRef(() => PraiseModule),
    forwardRef(() => SettingsModule),
    forwardRef(() => PeriodsModule),
    UserAccountsModule,
    UsersModule,
  ],
  providers: [QuantificationsService],
  exports: [
    QuantificationsService,
    MongooseModule.forFeature([
      { name: Quantification.name, schema: QuantificationsSchema },
    ]),
  ],
})
export class QuantificationsModule {}
