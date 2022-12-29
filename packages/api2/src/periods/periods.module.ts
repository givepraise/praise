import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PeriodsController } from './periods.controller';
import { PeriodsService } from './periods.service';
import { Period, PeriodSchema } from './schemas/periods.schema';
import { SettingsModule } from '@/settings/settings.module';
import { EventLogModule } from '@/event-log/event-log.module';
import { PraiseModule } from '@/praise/praise.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Period.name, schema: PeriodSchema }]),
    SettingsModule,
    EventLogModule,
    PraiseModule,
  ],
  controllers: [PeriodsController],
  providers: [PeriodsService],
  exports: [
    PeriodsService,
    MongooseModule.forFeature([{ name: Period.name, schema: PeriodSchema }]),
  ],
})
export class PeriodsModule {}
