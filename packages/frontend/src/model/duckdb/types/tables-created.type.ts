export type TablesCreated = {
  users: boolean;
  useraccounts: boolean;
  periods: boolean;
  praises: boolean;
  quantifications: boolean;
};

export const tablesCreatedDefaults: TablesCreated = {
  users: false,
  useraccounts: false,
  periods: false,
  praises: false,
  quantifications: false,
};
