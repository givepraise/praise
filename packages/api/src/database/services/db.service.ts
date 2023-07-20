import { Injectable, Scope, Inject } from '@nestjs/common';
import { Connection, PaginateModel } from 'mongoose';
import { InjectConnection } from '@nestjs/mongoose';
import { REQUEST } from '@nestjs/core';
import { Model } from 'mongoose';
import { HOSTNAME_TEST } from '../../constants/constants.provider';
import { hostNameToDbName } from '../utils/host-name-to-db-name';

@Injectable({ scope: Scope.REQUEST })
export class DbService {
  private readonly connection: Connection;

  constructor(
    @InjectConnection() conn: Connection,
    @Inject(REQUEST) private readonly request: any,
  ) {
    const host = this.getHostFromRequest();
    const db = hostNameToDbName(host);
    this.connection = conn.useDb(db);
  }

  getModel<TDocument>(name: string, schema: any): Model<TDocument> {
    return this.connection.model<TDocument>(name, schema);
  }

  getPaginateModel<TDocument>(
    name: string,
    schema: any,
  ): PaginateModel<TDocument> {
    return this.connection.model<TDocument>(
      name,
      schema,
    ) as PaginateModel<TDocument>;
  }

  getHostFromRequest(): string {
    return process.env.NODE_ENV === 'testing'
      ? HOSTNAME_TEST
      : this.request.headers['host'].split(':')[0];
  }
}
