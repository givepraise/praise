import { Permission } from './enums/permission.enum';

/**
 *  Defines which permissions are required for each role. This is used by the
 *  PermissionsGuard to check if the user has the required permissions to access
 *  the route.
 */
export const RolePermissions: { [key: string]: string[] } = {
  ADMIN: [
    Permission.ApiKeyView,
    Permission.ApiKeyManage,
    Permission.UsersFind,
    Permission.UsersManageRoles,
    Permission.EventLogView,
    Permission.PraiseFind,
  ],
  USER: [
    Permission.UsersFind,
    Permission.EventLogView,
    Permission.ApiKeyView,
    Permission.PraiseFind,
  ],
  QUANTIFIER: [Permission.PraiseQuantify],
};
