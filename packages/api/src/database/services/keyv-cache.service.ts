import { Inject, Injectable, Scope } from '@nestjs/common';
import Keyv from 'keyv';
import { REQUEST } from '@nestjs/core';
import { HOSTNAME_TEST } from '../../constants/constants.provider';
import { getDbUrl } from '../utils/get-db-url';
import { logger } from '../../shared/logger';

@Injectable({ scope: Scope.REQUEST })
export class KeyvCacheService {
  private keyv: Keyv;

  constructor(@Inject(REQUEST) private readonly request: any) {
    const host = this.getHostFromRequest();
    const dbUrl = getDbUrl(host);
    this.keyv = new Keyv(dbUrl);
    this.keyv.on('error', (err) => logger.error('Keyv Connection Error:', err));
  }

  getHostFromRequest(): string {
    return process.env.NODE_ENV === 'testing'
      ? HOSTNAME_TEST
      : this.request.headers['host'].split(':')[0];
  }

  // Expose the getKeyv function
  public getKeyv(): Keyv {
    return this.keyv;
  }
}
