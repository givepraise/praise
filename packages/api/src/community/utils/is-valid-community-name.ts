const communityNameBlacklist = [
  'www',
  'setup',
  'admin',
  'api',
  'app',
  'mail',
  'docs',
  'blog',
  'help',
  'support',
  'status',
  'about',
  'contact',
  'terms',
  'privacy',
  'tos',
  'legal',
  'security',
];

/**
 * A valid community name is:
 * - lowercase
 * - minimum 4 characters
 * - maximum 30 characters
 * - only alphanumeric characters, underscores, dots, and hyphens
 * - cannot start with a dot or hyphen
 * - cannot end with a dot or hyphen
 * - cannot contain two dots, two hyphens, or two underscores in a row
 */

export function checkCommunityNameRegex(name: string): boolean {
  const pattern = /^[a-z0-9][a-z0-9_.-]{1,28}[a-z0-9]$/;
  return pattern.test(name);
}

export function isValidCommunityName(name: string): boolean {
  const isRegexValid = checkCommunityNameRegex(name);
  if (!isRegexValid) {
    return false;
  }
  return !communityNameBlacklist.includes(name);
}
