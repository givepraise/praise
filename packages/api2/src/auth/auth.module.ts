import { AuthController } from './auth.controller';
import { EthSignatureService } from './eth-signature.service';
import { Module, forwardRef } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { UsersModule } from '@/users/users.module';
import { EventLogModule } from '@/event-log/event-log.module';
import { ApiKeyModule } from '@/api-key/api-key.module';
import { SettingsModule } from '@/settings/settings.module';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { ConstantsProvider } from '@/constants/constants.provider';
import { CommunityModule } from '@/community/community.module';

@Module({
  imports: [
    JwtModule.register({
      secret: `${process.env.JWT_SECRET}`,
      signOptions: { expiresIn: process.env.JWT_ACCESS_EXP },
    }),
    forwardRef(() => UsersModule),
    PassportModule,
    forwardRef(() => EventLogModule),
    ApiKeyModule,
    SettingsModule,
    forwardRef(() => CommunityModule),
  ],
  providers: [JwtService, EthSignatureService, ConstantsProvider],
  exports: [JwtService],
  controllers: [AuthController],
})
export class AuthModule {}
