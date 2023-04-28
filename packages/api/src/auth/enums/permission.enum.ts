export enum Permission {
  // API Key
  ApiKeyManage = 'apiKey:manage',
  ApiKeyView = 'apiKey:view',

  // Users
  UsersFind = 'users:find',
  UsersExport = 'users:export',
  UsersManageRoles = 'users:manageRoles',
  UserUpdateProfile = 'users:updateProfile',

  // User Accounts
  UserAccountsExport = 'userAccounts:export',
  UserAccountsView = 'userAccounts:view',
  UserAccountsCreate = 'userAccounts:create',
  UserAccountsUpdate = 'userAccounts:update',

  // Event Log
  EventLogView = 'eventLog:view',

  // Praise
  PraiseView = 'praise:view',
  PraiseQuantify = 'praise:quantify',
  PraiseExport = 'praise:export',
  PraiseCreate = 'praise:create',
  PraiseForward = 'praise:forward',

  // Period
  PeriodView = 'period:view',
  PeriodCreate = 'period:create',
  PeriodUpdate = 'period:update',
  PeriodAssign = 'period:assign',
  PeriodExport = 'period:export',

  // Quantifications
  QuantificationsExport = 'quantifications:export',

  // Settings
  SettingsView = 'settings:view',
  SettingsManage = 'settings:manage',

  // Period Settings
  PeriodSettingsView = 'periodSettings:view',
  PeriodSettingsManage = 'periodSettings:manage',

  // Community
  CommunitiesView = 'communities:view',
  CommunitiesCreate = 'communities:create',
  CommunitiesUpdate = 'communities:update',

  // Reports
  ReportsView = 'reports:view',
}
