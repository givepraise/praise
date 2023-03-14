import { EventLogModule } from '@/event-log/event-log.module';
import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schemas/users.schema';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { Praise, PraiseSchema } from '@/praise/schemas/praise.schema';
import { PeriodsModule } from '../periods/periods.module';
import { PraiseModule } from '@/praise/praise.module';
import { ConstantsProvider } from '@/constants/constants.provider';
import { ApiKeyModule } from '@/api-key/api-key.module';
import { AuthModule } from '@/auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    MongooseModule.forFeature([{ name: Praise.name, schema: PraiseSchema }]),
    forwardRef(() => PeriodsModule),
    EventLogModule,
    PraiseModule,
    forwardRef(() => AuthModule),
    ApiKeyModule,
  ],
  controllers: [UsersController],
  providers: [UsersService, ConstantsProvider],
  exports: [
    UsersService,
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
})
export class UsersModule {}
