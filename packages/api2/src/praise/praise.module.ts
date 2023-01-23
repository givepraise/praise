import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PraiseController } from './praise.controller';
import { PraiseService } from './praise.service';
import { Praise, PraiseSchema } from './schemas/praise.schema';
import { QuantificationsModule } from '@/quantifications/quantifications.module';
import { SettingsModule } from '@/settings/settings.module';
import { EventLogModule } from '@/event-log/event-log.module';
import { Period, PeriodSchema } from '@/periods/schemas/periods.schema';
import { PeriodsModule } from '@/periods/periods.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Praise.name, schema: PraiseSchema }]),
    MongooseModule.forFeature([{ name: Period.name, schema: PeriodSchema }]),
    forwardRef(() => PeriodsModule),
    forwardRef(() => QuantificationsModule),
    forwardRef(() => SettingsModule),
    EventLogModule,
  ],
  controllers: [PraiseController],
  providers: [PraiseService],
  exports: [
    PraiseService,
    MongooseModule.forFeature([{ name: Praise.name, schema: PraiseSchema }]),
  ],
})
export class PraiseModule {}
