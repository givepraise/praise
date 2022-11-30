import { ConstantsProvider } from '@/constants/constants.provider';
import { UtilsProvider } from '@/utils/utils.provider';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PraiseController } from './praise.controller';
import { PraiseService } from './praise.service';
import { Praise, PraiseSchema } from './schemas/praise.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Praise.name, schema: PraiseSchema }]),
  ],
  controllers: [PraiseController],
  providers: [PraiseService, UtilsProvider, ConstantsProvider],
})
export class PraiseModule {}
