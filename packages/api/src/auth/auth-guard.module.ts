import { Global, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ApiKeyModule } from '../api-key/api-key.module';
import { ApiKeyService } from '../api-key/api-key.service';
import { ConstantsProvider } from '../constants/constants.provider';
import { EventLogModule } from '../event-log/event-log.module';
import { AuthGuard } from './guards/auth.guard';

@Global()
@Module({
  imports: [
    JwtModule.register({
      global: true,
      secret: `${process.env.JWT_SECRET}`,
      signOptions: { expiresIn: process.env.JWT_ACCESS_EXP },
    }),
    ApiKeyModule,
    EventLogModule,
  ],
  providers: [AuthGuard, ApiKeyService, ConstantsProvider],
  exports: [AuthGuard],
})
export class AuthGuardModule {}
