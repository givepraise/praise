import { ServiceException } from '@/shared/exceptions/service-exception';
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';

@Injectable()
export class CommunityIdGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const communityId = request.headers['x-community-id'];
    if (!communityId) {
      throw new ServiceException('Header x-community-id is required.');
    }
    return true;
  }
}
