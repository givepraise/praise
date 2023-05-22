import { Setting } from './api-schema';
import { apiGet } from './api';

export const getDefaultSetting = (
  key: string
): string | string[] | boolean | number | number[] | undefined => {
  switch (key) {
    case 'PRAISE_SUCCESS_MESSAGE':
      return 'PRAISE SUCCESSFUL (message not set)';
    case 'FORWARD_SUCCESS_MESSAGE':
      return 'PRAISE FORWARD SUCCESSFUL (message not set)';
    case 'PRAISE_ACCOUNT_NOT_ACTIVATED_ERROR':
      return 'PRAISE ACCOUNT NOT ACTIVATED (message not set)';
    case 'PRAISE_ACCOUNT_ALREADY_ACTIVATED_ERROR':
      return 'PRAISE ACCOUNT ALREADY ACTIVATED (message not set)';
    case 'FORWARD_FROM_UNACTIVATED_GIVER_ERROR':
      return "PRAISE GIVER'S ACCOUNT NOT ACTIVATED (message not set)";
    case 'DM_ERROR':
      return 'COMMAND CAN NOT BE USED IN DM (message not set)';
    case 'PRAISE_WITHOUT_PRAISE_GIVER_ROLE_ERROR':
      return 'USER DOES NOT HAVE {@role} role (message not set)';
    case 'PRAISE_INVALID_RECEIVERS_ERROR':
      return 'VALID RECEIVERS NOT MENTIONED (message not set)';
    case 'PRAISE_REASON_MISSING_ERROR':
      return 'REASON NOT MENTIONED (message not set)';
    case 'PRAISE_UNDEFINED_RECEIVERS_WARNING':
      return 'UNDEFINED RECEIVERS MENTIONED, UNABLE TO PRAISE THEM (message not set)';
    case 'PRAISE_TO_ROLE_WARNING':
      return "ROLES MENTIONED AS PRAISE RECEIVERS, PRAISE CAN'T BE DISHED TO ROLES (message not set)";
    case 'PRAISE_SUCCESS_DM':
      return '[YOU HAVE BEEN PRAISED!!!]({praiseURL) (message not set)';
    case 'SELF_PRAISE_WARNING':
      return 'SELF-PRAISE NOT ALLOWED, PRAISE GIVERS UNABLE TO PRAISE THEMSELVES (message not set)';
    case 'FIRST_TIME_PRAISER':
      return 'YOU ARE PRAISING FOR THE FIRST TIME. WELCOME TO PRAISE! (message not set)';
    case 'PRAISE_ALLOWED_IN_ALL_CHANNELS':
      return true;
    case 'PRAISE_ALLOWED_CHANNEL_IDS':
      return [] as string[];
    case 'PRAISE_GIVER_ROLE_ID_REQUIRED':
      return false;
    case 'PRAISE_GIVER_ROLE_ID':
      return undefined;
    case 'SELF_PRAISE_ALLOWED':
      return false;
    case 'PRAISE_ACCOUNT_NOT_ACTIVATED_ERROR_DM':
      return 'In order to claim your praise, link your discord account to your ethereum wallet using the `/activate` command';
    case 'FORWARDER_ROLE_WARNING':
      return "**❌ You don't have the permission to use this command.**";
    case 'INVALID_REASON_LENGTH':
      return 'Reason should be between 5 to 280 characters';
    case 'FORWARD_FORWARD_FAILED':
      return 'Forward Failed :(';
    case 'PRAISE_FAILED':
      return 'Praise Failed :(';
  }
};

export const getSetting = async (
  key: string,
  host?: string
): Promise<string | string[] | boolean | number | number[] | undefined> => {
  const setting = await apiGet<Setting[]>(`/settings?key=${key}`, {
      headers: host ? { host: host } : {},
    })
    .then((res) => (res.data[0] as Setting).valueRealized)
    .catch(() => getDefaultSetting(key));

  return setting;
};
