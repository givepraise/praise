// import { ConfigService } from '@nestjs/config';
// import { MongooseModuleFactoryOptions } from '@nestjs/mongoose';

// export const praiseDatabaseUri = (
//   configService: ConfigService,
// ): MongooseModuleFactoryOptions => ({
//   uri: `mongodb://${configService.get<string>(
//     'MONGO_USERNAME',
//   )}:${configService.get<string>('MONGO_PASSWORD')}@${configService.get<string>(
//     'MONGO_HOST',
//   )}:${configService.get<string>('MONGO_PORT')}/${configService.get<string>(
//     'MONGO_DB',
//   )}`,
// });

export const praiseDatabaseUri = `mongodb://${process.env.MONGO_USERNAME}:${process.env.MONGO_PASSWORD}@${process.env.MONGO_HOST}:${process.env.MONGO_PORT}/${process.env.MONGO_DB}`;
