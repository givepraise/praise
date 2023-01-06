import { SettingsModule } from '@/settings/settings.module';
import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { QuantificationsService } from './quantifications.service';
import {
  Quantification,
  QuantificationsSchema,
} from './schemas/quantifications.schema';
import { UserAccountsModule } from '@/useraccounts/useraccounts.module';
import { UsersModule } from '@/users/users.module';
import { PraiseModule } from '@/praise/praise.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Quantification.name, schema: QuantificationsSchema },
    ]),
    SettingsModule,
    forwardRef(() => PraiseModule),
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
