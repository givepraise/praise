import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { UsersModule } from '@/users/users.module';
import { UsersService } from '@/users/users.service';
import { UtilsProvider } from '@/utils/utils.provider';
import { ConstantsProvider } from '@/constants/constants.provider';
import { EthSignatureStrategy } from './strategies/eth-signature.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: process.env.JWT_ACCESS_EXP },
    }),
  ],
  providers: [
    AuthService,
    UsersService,
    JwtStrategy,
    EthSignatureStrategy,
    UtilsProvider,
    ConstantsProvider,
  ],
  controllers: [AuthController],
})
export class AuthModule {}
