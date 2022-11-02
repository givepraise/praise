import { randomBytes } from 'crypto';

export const randomString = (bytes = 10): string =>
  randomBytes(bytes).toString('hex');
