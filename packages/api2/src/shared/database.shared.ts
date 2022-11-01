import { ConfigService } from '@nestjs/config';
import { MongooseModuleFactoryOptions } from '@nestjs/mongoose';

export const praiseDatabaseUri = (
  configService: ConfigService,
): MongooseModuleFactoryOptions => ({
  uri: `mongodb://${configService.get<string>(
    'MONGO_USERNAME',
  )}:${configService.get<string>('MONGO_PASSWORD')}@${configService.get<string>(
    'MONGO_HOST',
  )}:${configService.get<string>('MONGO_PORT')}/${configService.get<string>(
    'MONGO_DB',
  )}`,
});
