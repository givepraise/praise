/**
 * The db name is almost identical to the hostname, except that dots are
 * replaced with dashes. This is because dots are not allowed in db names.
 */
export const hostNameToDbName = (hostname: string) =>
  hostname.replace(/\./g, '-');
