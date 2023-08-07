export function errorHasMessage(obj: unknown): obj is { message?: string } {
  return typeof obj === 'object' && obj !== null && 'message' in obj;
}
