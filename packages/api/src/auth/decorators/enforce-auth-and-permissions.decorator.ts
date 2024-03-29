import { UseGuards, applyDecorators } from '@nestjs/common';
import { PermissionsGuard } from '../guards/permissions.guard';
import { AuthGuard } from '../guards/auth.guard';

/**
 * The EnforceAuthAndPermissions decorator joins the BypassGuard, JwtGuard, ApiKeyGuard and PermissionsGuard
 * into a single decorator. User is authenticated if one of the authentication guards succeeds.
 * Then the PermissionsGuard is used to check if the user has the required permissions.
 */
export function EnforceAuthAndPermissions() {
  return applyDecorators(
    UseGuards(AuthGuard),
    // Authorization
    UseGuards(PermissionsGuard),
  );
}
