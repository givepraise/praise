export const dbNameCommunity = (community: { hostname: string }) =>
  community.hostname.replace(/\./g, '-');
