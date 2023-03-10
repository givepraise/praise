export interface UserAccount {
  /** @example 63b428f7d9ca4f6ff5370d05 */
  _id: string;
  /** @example 63b428f7d9ca4f6ff5370d05 */
  user: string;
  /** @example 098098098098098 */
  accountId: string;
  /** @example darth#6755 */
  name: string;
  /** @example 098098098087097 */
  avatarId: string;
  /** @example DISCORD */
  platform: string;
  /** Format: date-time */
  createdAt: string;
  /** Format: date-time */
  updatedAt: string;
}
interface UserAccountNoUserId {
  /** @example 63b428f7d9ca4f6ff5370d05 */
  _id: string;
  /** @example 63b428f7d9ca4f6ff5370d05 */
  user: string;
  /** @example 098098098098098 */
  accountId: string;
  /** @example darth#6755 */
  name: string;
  /** @example 098098098087097 */
  avatarId: string;
  /** @example DISCORD */
  platform: string;
  /** Format: date-time */
  createdAt: string;
  /** Format: date-time */
  updatedAt: string;
}

export interface User {
  /** @example 5f9f1b9b9b9b9b9b9b9b9b9b */
  _id: string;
  /** @example 0xAAB27b150451726EC7738aa1d0A94505c8729bd1 */
  identityEthAddress: string;
  /** @example 0xAAB27b150451726EC7738aa1d0A94505c8729bd1 */
  rewardsEthAddress: string;
  /** @example darth */
  username: string;
  /** @example ["USER"] */
  roles: string;
  accounts: UserAccountNoUserId[];
  /** Format: date-time */
  createdAt: string;
  /** Format: date-time */
  updatedAt: string;
}

export interface Setting {
  /** @example 621f802b813dbdbaddeaf799 */
  _id: string;
  /** @example SETTING_KEY */
  key: string;
  /** @example 666 */
  value: string;
  /** @example 666 */
  valueRealized: Record<string, never>;
  /** @example 555 */
  defaultValue: string;
  /**
   * @example Integer
   * @enum {string}
   */
  type:
    | 'Integer'
    | 'Float'
    | 'String'
    | 'Textarea'
    | 'Boolean'
    | 'IntegerList'
    | 'StringList'
    | 'Image'
    | 'Radio'
    | 'JSON';
  /** @example Quantifiers Per Praise */
  label: string;
  /** @example How many redundant quantifications are assigned to each praise? */
  description: string;
  /** @example 0 */
  group: number;
  options: string;
  /** @example 0 */
  subgroup: number;
  /** @example true */
  periodOverridable: boolean;
}
