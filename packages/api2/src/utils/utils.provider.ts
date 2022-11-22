import { Injectable } from '@nestjs/common';
import { randomBytes } from 'crypto';

@Injectable()
export class UtilsProvider {
  randomString(bytes = 10): string {
    return randomBytes(bytes).toString('hex');
  }
}
