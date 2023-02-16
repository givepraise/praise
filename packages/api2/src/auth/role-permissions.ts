import { Permission } from './enums/permission.enum';

/**
 *  Defines which permissions are required for each role. This is used by the
 *  PermissionsGuard to check if the user has the required permissions to access
 *  the route.
 */
const PERMISSIONS_USER = [
  Permission.UsersFind,
  Permission.UserUpdateProfile,
  Permission.UsersExport,
  Permission.EventLogView,
  Permission.ApiKeyView,
  Permission.PraiseView,
  Permission.PraiseExport,
  Permission.SettingsView,
  Permission.PeriodSettingsView,
  Permission.PeriodView,
  Permission.PeriodExport,
  Permission.QuantificationsExport,
  Permission.UserAccountsExport,
];

/**
 * A forwarder is a user that is allowed to forward praises on behalf of other users.
 */
const PERMISSIONS_FORWARDER = [...PERMISSIONS_USER];

/**
 * Quantifiers are users that are allowed to quantify praises.
 */
const PERMISSIONS_QUANTIFIER = [...PERMISSIONS_USER, Permission.PraiseQuantify];

/**
 * Admins are users that are allowed to manage the system.
 * They can create new periods, manage users and manage the system settings.
 * They can also manage API keys.
 */
const PERMISSIONS_ADMIN = [
  ...PERMISSIONS_USER,
  Permission.ApiKeyManage,
  Permission.UsersManageRoles,
  Permission.SettingsManage,
  Permission.PeriodSettingsManage,
  Permission.PeriodCreate,
  Permission.PeriodUpdate,
  Permission.PeriodAssign,
];

/**
 * API keys can be used to access the API. They can be created with different
 * permissions.
 */
/**
 * API keys with read permissions can only read data from the API.
 */
const PERMISSION_APIKEY_READ = [...PERMISSIONS_USER];

/**
 * API keys with read/write permissions can read and write data to the API.
 */
const PERMISSION_APIKEY_READWRITE = [...PERMISSIONS_USER];

/**
 * Defines which permissions are required for each role. This is used by the
 * PermissionsGuard to check if the user has the required permissions to access
 * the route.
 */
export const RolePermissions: { [key: string]: string[] } = {
  USER: PERMISSIONS_USER,
  FORWARDER: PERMISSIONS_FORWARDER,
  QUANTIFIER: PERMISSIONS_QUANTIFIER,
  ADMIN: PERMISSIONS_ADMIN,
  APIKEY_READ: PERMISSION_APIKEY_READ,
  APIKEY_READWRITE: PERMISSION_APIKEY_READWRITE,
};
