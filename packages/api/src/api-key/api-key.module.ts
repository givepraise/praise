import { ConstantsProvider } from '../constants/constants.provider';
import { EventLogModule } from '../event-log/event-log.module';
import { Global, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ApiKeyController } from './api-key.controller';
import { ApiKeyService } from './api-key.service';
import { ApiKey, ApiKeySchema } from './schemas/api-key.schema';
import { DbService } from '../database/services/db.service';

@Global()
@Module({
  imports: [
    MongooseModule.forFeature([{ name: ApiKey.name, schema: ApiKeySchema }]),
    EventLogModule,
  ],
  controllers: [ApiKeyController],
  providers: [ApiKeyService, ConstantsProvider, DbService],
  exports: [
    MongooseModule.forFeature([{ name: ApiKey.name, schema: ApiKeySchema }]),
    ApiKeyService,
  ],
})
export class ApiKeyModule {}
