import { AuthGuard } from '@nestjs/passport';
import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { shouldBypassAuth } from '../utils/should-bypass-auth.util';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    return (
      shouldBypassAuth(context, this.reflector) || super.canActivate(context)
    );
  }
}
