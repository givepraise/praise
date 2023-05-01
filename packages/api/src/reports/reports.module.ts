import { Module } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import { ConstantsProvider } from '../constants/constants.provider';

@Module({
  controllers: [ReportsController],
  providers: [ReportsService, ConstantsProvider],
})
export class ReportsModule {}
