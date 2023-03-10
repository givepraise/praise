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
  Permission.UserAccountsView,
  Permission.UserAccountsCreate,
  Permission.UserAccountsUpdate,
];

/**
 * A forwarder is a user that is allowed to forward praises on behalf of other users.
 * Currently forwarding does not requiere any special permissions, check is instead
 * done by the praise service.
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
 * Root users are users that are allowed to manage the system.
 * In addition to the admin permissions, they can also manage communities.
 */
const PERMISSIONS_ROOT = [
  ...PERMISSIONS_ADMIN,
  Permission.CommunitiesCreate,
  Permission.CommunitiesView,
  Permission.CommunitiesUpdate,
];

/**
 * API keys can be used to access the API. They can be created with different
 * permissions.
 */
/**
 * API keys with read permissions can only read data from the API.
 */
const PERMISSION_API_KEY_READ = [...PERMISSIONS_USER];

/**
 * API keys with read/write permissions can read and write data to the API.
 * Currrently this set of permissions is the same as the admin permissions.
 */
const PERMISSION_API_KEY_READWRITE = [...PERMISSIONS_ADMIN];

/**
 * Discord bot permissions
 * The discord bot can only praise users.
 */
const PERMISSION_API_KEY_DISCORD_BOT = [
  Permission.UserAccountsView,
  Permission.UserAccountsCreate,
  Permission.UserAccountsUpdate,
  Permission.PraiseCreate,
  Permission.PraiseForward,
  Permission.CommunitiesView,
  Permission.SettingsView,
];

/**
 * Setup Web  permissions
 * The setup web is in charge for managing communities
 */
const PERMISSION_API_KEY_SETUP_WEB = [
  Permission.CommunitiesCreate,
  Permission.CommunitiesView,
  Permission.CommunitiesUpdate,
];

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
  ROOT: PERMISSIONS_ROOT,
  API_KEY_READ: PERMISSION_API_KEY_READ,
  API_KEY_READWRITE: PERMISSION_API_KEY_READWRITE,
  API_KEY_DISCORD_BOT: PERMISSION_API_KEY_DISCORD_BOT,
  API_KEY_SETUP_WEB: PERMISSION_API_KEY_SETUP_WEB,
};
