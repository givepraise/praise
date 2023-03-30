import { ConstantsProvider } from '../constants/constants.provider';
import { EventLogModule } from '../event-log/event-log.module';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ApiKeyController } from './api-key.controller';
import { ApiKeyService } from './api-key.service';
import { ApiKey, ApiKeySchema } from './schemas/api-key.schema';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: ApiKey.name, schema: ApiKeySchema }]),
    EventLogModule,
  ],
  controllers: [ApiKeyController],
  providers: [ApiKeyService, ConstantsProvider],
  exports: [ApiKeyService],
})
export class ApiKeyModule {}
