import { Test, TestingModule } from '@nestjs/testing';
import { User, UserSchema } from '@/users/schemas/users.schema';

import { AuthService } from './auth.service';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersService } from '@/users/users.service';
import { praiseDatabaseUri } from '@/shared/database.shared';
import { JwtService } from '@nestjs/jwt';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
      ],
      providers: [AuthService, UsersService, JwtService],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
