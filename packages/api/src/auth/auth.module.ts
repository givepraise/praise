import { AuthController } from './auth.controller';
import { EthSignatureService } from './eth-signature.service';
import { Module } from '@nestjs/common';
import { EventLogModule } from '../event-log/event-log.module';
import { SettingsModule } from '../settings/settings.module';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { CommunityModule } from '../community/community.module';

@Module({
  imports: [
    JwtModule.register({
      secret: `${process.env.JWT_SECRET}`,
      signOptions: { expiresIn: process.env.JWT_ACCESS_EXP },
    }),
    EventLogModule,
    SettingsModule,
    CommunityModule,
  ],
  providers: [JwtService, EthSignatureService],
  exports: [JwtService],
  controllers: [AuthController],
})
export class AuthModule {}
