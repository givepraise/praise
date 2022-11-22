import { ConfigModule, ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { User, UserSchema } from './schemas/users.schema';

import { MongooseModule } from '@nestjs/mongoose';
import { UserAccountsModule } from '@/useraccounts/useraccounts.module';
import { UsersModule } from './users.module';
import { UsersService } from './users.service';
import { praiseDatabaseUri } from '@/shared/database.shared';

describe('UsersService', () => {
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        MongooseModule.forRootAsync({
          imports: [ConfigModule],
          useFactory: praiseDatabaseUri,
          inject: [ConfigService],
        }),
        MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
        UsersModule,
        UserAccountsModule,
      ],
      providers: [UsersService],
    }).compile();
    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return a list of user objects', async () => {
    expect(await service.findAll()).toBeInstanceOf(Array);
  });
});
