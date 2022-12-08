import { PraiseService } from '@/praise/praise.service';
import { Praise, PraiseSchema } from '@/praise/schemas/praise.schema';
import { SettingsService } from '@/settings/settings.service';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { QuantificationsService } from './quantifications.service';
import {
  Quantification,
  QuantificationsSchema,
} from './schemas/quantifications.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Quantification.name, schema: QuantificationsSchema },
    ]),
    MongooseModule.forFeature([{ name: Praise.name, schema: PraiseSchema }]),
  ],
  providers: [QuantificationsService, PraiseService, SettingsService],
})
export class UserAccountsModule {}
