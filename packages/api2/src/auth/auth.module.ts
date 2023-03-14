import { AuthController } from './auth.controller';
import { EthSignatureService } from './eth-signature.service';
import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { UsersModule } from '@/users/users.module';
import { EthSignatureStrategy } from './strategies/eth-signature.strategy';
import { EventLogModule } from '@/event-log/event-log.module';
import { ApiKeyModule } from '@/api-key/api-key.module';
import { SettingsModule } from '@/settings/settings.module';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { ConstantsProvider } from '@/constants/constants.provider';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: process.env.JWT_ACCESS_EXP },
    }),
    UsersModule,
    PassportModule,
    EventLogModule,
    ApiKeyModule,
    SettingsModule,
  ],
  providers: [
    JwtService,
    EthSignatureService,
    EthSignatureStrategy,
    ConstantsProvider,
  ],
  exports: [JwtService],
  controllers: [AuthController],
})
export class AuthModule {}
