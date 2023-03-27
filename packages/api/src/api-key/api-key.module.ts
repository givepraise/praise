import { ConstantsProvider } from '../constants/constants.provider';
import { EventLogModule } from '../event-log/event-log.module';
import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ApiKeyController } from './api-key.controller';
import { ApiKeyService } from './api-key.service';
import { ApiKey, ApiKeySchema } from './schemas/api-key.schema';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: ApiKey.name, schema: ApiKeySchema }]),
    forwardRef(() => EventLogModule),
    forwardRef(() => AuthModule),
  ],
  controllers: [ApiKeyController],
  providers: [ApiKeyService, ConstantsProvider],
  exports: [ApiKeyService],
})
export class ApiKeyModule {}
