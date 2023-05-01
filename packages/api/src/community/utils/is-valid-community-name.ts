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

export function isValidCommunityName(name: string): boolean {
  const pattern = /^[a-z0-9][a-z0-9_.-]{1,28}[a-z0-9]$/;
  return pattern.test(name);
}
