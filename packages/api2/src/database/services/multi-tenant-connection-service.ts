import { Inject, Injectable, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import {
  MongooseModuleOptions,
  MongooseOptionsFactory,
} from '@nestjs/mongoose';

@Injectable({ scope: Scope.REQUEST })
export class MultiTenantConnectionService implements MongooseOptionsFactory {
  constructor(@Inject(REQUEST) private readonly request: any) {}

  createMongooseOptions(): MongooseModuleOptions {
    const communityId = this.request.headers['x-community-id'];
    return {
      uri: `mongodb://${process.env.MONGO_USERNAME}:${process.env.MONGO_PASSWORD}@${process.env.MONGO_HOST}:${process.env.MONGO_PORT}/${communityId}?authSource=admin&appname=PraiseApi`,
    };
  }
}
