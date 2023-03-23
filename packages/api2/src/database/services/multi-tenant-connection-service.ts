/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { TEST_COMMUNITY_DB_NAME } from '@/constants/constants.provider';
import { Inject, Injectable, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import {
  MongooseModuleOptions,
  MongooseOptionsFactory,
} from '@nestjs/mongoose';

const dbUri = (db: string) => ({
  uri: `mongodb://${process.env.MONGO_USERNAME}:${process.env.MONGO_PASSWORD}@${process.env.MONGO_HOST}:${process.env.MONGO_PORT}/${db}?authSource=admin&appname=PraiseApi`,
});

@Injectable({ scope: Scope.REQUEST })
export class MultiTenantConnectionService implements MongooseOptionsFactory {
  constructor(@Inject(REQUEST) private readonly request: any) {}

  async createMongooseOptions(): Promise<MongooseModuleOptions> {
    const host =
      process.env.NODE_ENV === 'testing'
        ? TEST_COMMUNITY_DB_NAME
        : this.request.headers['host'].split(':')[0];
    return dbUri(host);
  }
}
