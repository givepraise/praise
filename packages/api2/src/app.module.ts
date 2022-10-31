import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { UserAccountsModule } from './useraccounts/useraccounts.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        uri: `mongodb://${configService.get<string>(
          'MONGO_USERNAME',
        )}:${configService.get<string>(
          'MONGO_PASSWORD',
        )}@${configService.get<string>(
          'MONGO_HOST',
        )}:${configService.get<string>(
          'MONGO_PORT',
        )}/${configService.get<string>('MONGO_DB')}`,
      }),
      inject: [ConfigService],
    }),

    UsersModule,
    UserAccountsModule,
  ],
})
export class AppModule {}
