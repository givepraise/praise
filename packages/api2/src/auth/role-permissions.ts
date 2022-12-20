import { Permission } from './enums/permission.enum';

/**
 *  Defines which permissions are required for each role. This is used by the
 *  PermissionsGuard to check if the user has the required permissions to access
 *  the route.
 */
const PERMISSIONS_USER = [
  Permission.UsersFind,
  Permission.EventLogView,
  Permission.ApiKeyView,
];
const PERMISSIONS_FORWARDER = [...PERMISSIONS_USER];
const PERMISSIONS_QUANTIFIER = [...PERMISSIONS_USER];
const PERMISSIONS_ADMIN = [
  ...PERMISSIONS_USER,
  Permission.ApiKeyManage,
  Permission.UsersManageRoles,
];
const PERMISSION_APIKEY_READ = [...PERMISSIONS_USER];
const PERMISSION_APIKEY_READWRITE = [...PERMISSIONS_USER];

export const RolePermissions: { [key: string]: string[] } = {
  USER: PERMISSIONS_USER,
  FORWARDER: PERMISSIONS_FORWARDER,
  QUANTIFIER: PERMISSIONS_QUANTIFIER,
  ADMIN: PERMISSIONS_ADMIN,
  APIKEY_READ: PERMISSION_APIKEY_READ,
  APIKEY_READWRITE: PERMISSION_APIKEY_READWRITE,
};
