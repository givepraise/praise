import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PraiseController } from './praise.controller';
import { PraiseService } from './praise.service';
import { Praise, PraiseSchema } from './schemas/praise.schema';
import { QuantificationsModule } from '@/quantifications/quantifications.module';
import { PeriodsModule } from '@/periods/periods.module';
import { SettingsModule } from '@/settings/settings.module';
import { EventLogModule } from '@/event-log/event-log.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Praise.name, schema: PraiseSchema }]),
    PeriodsModule,
    QuantificationsModule,
    SettingsModule,
    EventLogModule,
  ],
  controllers: [PraiseController],
  providers: [PraiseService],
  exports: [PraiseService],
})
export class PraiseModule {}
