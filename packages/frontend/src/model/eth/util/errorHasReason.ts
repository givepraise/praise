export function errorHasReason(obj: unknown): obj is { reason?: string } {
  return typeof obj === 'object' && obj !== null && 'reason' in obj;
}
