import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { UsersModule } from '@/users/users.module';
import { UsersService } from '@/users/users.service';
import { JwtStrategy } from './jwt.strategy';
import { UtilsProvider } from '@/utils/utils.provider';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '60s' },
    }),
  ],
  providers: [AuthService, UsersService, JwtStrategy, UtilsProvider],
  controllers: [AuthController],
})
export class AuthModule {}
