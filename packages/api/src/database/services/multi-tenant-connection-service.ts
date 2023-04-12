/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { HOSTNAME_TEST } from '../../constants/constants.provider';
import { Inject, Injectable, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import {
  MongooseModuleOptions,
  MongooseOptionsFactory,
} from '@nestjs/mongoose';
import { dbUrlCommunity } from '../utils/db-url-community';

@Injectable({ scope: Scope.REQUEST })
export class MultiTenantConnectionService implements MongooseOptionsFactory {
  constructor(@Inject(REQUEST) private readonly request: any) {}

  async createMongooseOptions(): Promise<MongooseModuleOptions> {
    const host =
      process.env.NODE_ENV === 'testing'
        ? HOSTNAME_TEST
        : this.request.headers['host'].split(':')[0];
    return {
      uri: dbUrlCommunity({ hostname: host } as any),
    };
  }
}
