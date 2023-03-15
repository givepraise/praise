import { Module, forwardRef } from '@nestjs/common';
import { PeriodSettingsService } from './periodsettings.service';
import { PeriodSettingsController } from './periodsettings.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
  PeriodSetting,
  PeriodSettingsSchema,
} from './schemas/periodsettings.schema';
import { PeriodsModule } from '@/periods/periods.module';
import { ConstantsProvider } from '@/constants/constants.provider';
import { EventLogModule } from '@/event-log/event-log.module';
import { SettingsModule } from '@/settings/settings.module';
import { ApiKeyModule } from '@/api-key/api-key.module';
import { AuthModule } from '@/auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: PeriodSetting.name, schema: PeriodSettingsSchema },
    ]),
    forwardRef(() => EventLogModule),
    forwardRef(() => PeriodsModule),
    forwardRef(() => SettingsModule),
    forwardRef(() => AuthModule),
    ApiKeyModule,
  ],
  controllers: [PeriodSettingsController],
  providers: [PeriodSettingsService, ConstantsProvider],
  exports: [PeriodSettingsService],
})
export class PeriodSettingsModule {}
