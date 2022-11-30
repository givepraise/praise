import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CoreController } from './controllers/core.controller';
import { PeriodsService } from './periods.service';
import { Period, PeriodSchema } from './schemas/periods.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Period.name, schema: PeriodSchema }]),
  ],
  controllers: [CoreController],
  providers: [PeriodsService],
  exports: [
    PeriodsService,
    MongooseModule.forFeature([{ name: Period.name, schema: PeriodSchema }]),
  ],
})
export class PeriodsModule {}
