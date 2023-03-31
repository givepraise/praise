import { EventLogModule } from '../event-log/event-log.module';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schemas/users.schema';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { PeriodsModule } from '../periods/periods.module';
import { PraiseModule } from '../praise/praise.module';
import { ConstantsProvider } from '../constants/constants.provider';
import { Praise, PraiseSchema } from '../praise/schemas/praise.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Praise.name, schema: PraiseSchema },
    ]),
    PeriodsModule,
    EventLogModule,
    PraiseModule,
  ],
  controllers: [UsersController],
  providers: [UsersService, ConstantsProvider],
  exports: [UsersService],
})
export class UsersModule {}
