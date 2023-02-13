import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { BYPASS_KEY } from '../decorators/bypass-auth.decorator';

export const shouldBypassAuth = (
  context: ExecutionContext,
  reflector: Reflector,
): boolean => {
  return reflector.get(BYPASS_KEY, context.getHandler());
};
