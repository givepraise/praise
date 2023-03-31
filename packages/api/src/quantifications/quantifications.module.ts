import { SettingsModule } from '../settings/settings.module';
import { MongooseModule } from '@nestjs/mongoose';
import { QuantificationsService } from './services/quantifications.service';
import {
  Quantification,
  QuantificationsSchema,
} from './schemas/quantifications.schema';
import { PraiseModule } from '../praise/praise.module';
import { PeriodsModule } from '../periods/periods.module';
import { Module } from '@nestjs/common';
import { QuantificationsController } from './quantitifcations.controller';
import { QuantificationsExportService } from './services/quantifications-export.service';
import { ConstantsProvider } from '../constants/constants.provider';
import { Praise, PraiseSchema } from '../praise/schemas/praise.schema';
import { EventLogModule } from '../event-log/event-log.module';
import { PeriodsService } from '../periods/services/periods.service';
import { PraiseService } from '../praise/services/praise.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Quantification.name, schema: QuantificationsSchema },
      { name: Praise.name, schema: PraiseSchema },
    ]),
    PraiseModule,
    SettingsModule,
    PeriodsModule,
    EventLogModule,
  ],
  controllers: [QuantificationsController],
  providers: [
    QuantificationsService,
    QuantificationsExportService,
    ConstantsProvider,
    PraiseService,
    PeriodsService,
  ],
  exports: [QuantificationsService],
})
export class QuantificationsModule {}
