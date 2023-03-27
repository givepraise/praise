import { Community } from '../../community/schemas/community.schema';

export const dbNameCommunity = (community: Community) =>
  community.hostname.replace(/\./g, '-');
