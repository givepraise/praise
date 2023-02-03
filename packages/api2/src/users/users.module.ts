import { EventLogModule } from '@/event-log/event-log.module';
import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schemas/users.schema';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { Praise, PraiseSchema } from '@/praise/schemas/praise.schema';
import { PeriodsModule } from '../periods/periods.module';
import { PraiseModule } from '@/praise/praise.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    MongooseModule.forFeature([{ name: Praise.name, schema: PraiseSchema }]),
    forwardRef(() => PeriodsModule),
    EventLogModule,
    PraiseModule,
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [
    UsersService,
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
})
export class UsersModule {}
