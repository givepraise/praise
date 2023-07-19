import { EthSignatureController } from './eth-signature.controller';
import { EthSignatureService } from './eth-signature.service';
import { Module } from '@nestjs/common';
import { EventLogModule } from '../event-log/event-log.module';
import { UsersModule } from '../users/users.module';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../users/schemas/users.schema';
import { DbService } from '../database/services/db.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    EventLogModule,
    UsersModule,
  ],
  providers: [EthSignatureService, DbService],
  controllers: [EthSignatureController],
})
export class EthSignatureModule {}
