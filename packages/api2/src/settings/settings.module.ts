import { FileUtilsProvider } from '@/settings/providers/file-utils.provider';
import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConstantsProvider } from '@/constants/constants.provider';
import { Setting, SettingSchema } from './schemas/settings.schema';
import { SettingsController } from './settings.controller';
import { SettingsService } from './settings.service';
import { EventLogModule } from '@/event-log/event-log.module';
import { PeriodSettingsModule } from '@/periodsettings/periodsettings.module';
import { AuthModule } from '@/auth/auth.module';
import { ApiKeyModule } from '@/api-key/api-key.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Setting.name, schema: SettingSchema }]),
    forwardRef(() => EventLogModule),
    forwardRef(() => PeriodSettingsModule),
    forwardRef(() => AuthModule),
    ApiKeyModule,
  ],
  controllers: [SettingsController],
  providers: [SettingsService, FileUtilsProvider, ConstantsProvider],
  exports: [SettingsService],
})
export class SettingsModule {}
