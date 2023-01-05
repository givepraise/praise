import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PeriodsController } from './periods.controller';
import { PeriodsService } from './periods.service';
import { Period, PeriodSchema } from './schemas/periods.schema';
import { EventLogModule } from '../event-log/event-log.module';
import { PraiseModule } from '@/praise/praise.module';
import { QuantificationsModule } from '@/quantifications/quantifications.module';
import { SettingsModule } from '@/settings/settings.module';
import { UsersModule } from '@/users/users.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Period.name, schema: PeriodSchema }]),
    EventLogModule,
    forwardRef(() => PraiseModule),
    forwardRef(() => QuantificationsModule),
    forwardRef(() => SettingsModule),
    forwardRef(() => UsersModule),
    UserAccountModule,
  ],
  controllers: [PeriodsController],
  providers: [PeriodsService],
  exports: [PeriodsService],
})
export class PeriodsModule {}
