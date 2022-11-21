import { ExtractJwt, Strategy } from 'passport-jwt';

import { Injectable } from '@nestjs/common';
import { JwtPayload } from './dto/jwt-payload.dto';
import { PassportStrategy } from '@nestjs/passport';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  async validate(payload: JwtPayload) {
    return { userId: payload.userId };
  }
}
