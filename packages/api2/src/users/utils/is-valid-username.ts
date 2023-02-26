export function isValidUsername(username: string) {
  // Only allow alphanumeric characters, underscores, dots, and hyphens
  const pattern = /^[A-Za-z0-9_.-]+$/;
  return pattern.test(username);
}
