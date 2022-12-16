import { AuthController } from './auth.controller';
import { EthSignatureService } from './eth-signature.service';
import { JwtModule } from '@nestjs/jwt';
import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { UsersModule } from '@/users/users.module';
import { UtilsProvider } from '@/utils/utils.provider';
import { ConstantsProvider } from '@/constants/constants.provider';
import { EthSignatureStrategy } from './strategies/eth-signature.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';
import { EventLogModule } from '@/event-log/event-log.module';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: process.env.JWT_ACCESS_EXP },
    }),
    EventLogModule,
  ],
  providers: [
    EthSignatureService,
    JwtStrategy,
    EthSignatureStrategy,
    UtilsProvider,
    ConstantsProvider,
  ],
  controllers: [AuthController],
})
export class AuthModule {}
