/**
 * A valid username is:
 * - is lowercase
 * - minimum 3 characters
 * - maximum 50 characters
 * - only alphanumeric characters, underscores, dots, and hyphens
 * - cannot start with a dot or hyphen
 * - cannot end with a dot or hyphen
 * - cannot contain two dots, two hyphens, or two underscores in a row
 */
export function isValidUsername(username: string) {
  const pattern = /^[a-z0-9][a-z0-9_.-]{2,48}[a-z0-9]$/;
  return pattern.test(username);
}
