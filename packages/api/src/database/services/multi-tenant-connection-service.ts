/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { HOSTNAME_TEST } from '../../constants/constants.provider';
import { Inject, Injectable, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import {
  MongooseModuleOptions,
  MongooseOptionsFactory,
} from '@nestjs/mongoose';
import { dbUrlCommunity } from '../utils/db-url-community';
import { Connection } from 'mongoose';
import { dbNameCommunity } from '../utils/db-name-community';
import { ApiException } from '../../shared/exceptions/api-exception';
import { errorMessages } from '../../shared/exceptions/error-messages';

@Injectable({ scope: Scope.REQUEST })
export class MultiTenantConnectionService implements MongooseOptionsFactory {
  constructor(@Inject(REQUEST) private readonly request: any) {}

  async createMongooseOptions(): Promise<MongooseModuleOptions> {
    const host =
      process.env.NODE_ENV === 'testing'
        ? HOSTNAME_TEST
        : this.request.headers['host'].split(':')[0];

    const options: MongooseModuleOptions = {
      uri: dbUrlCommunity({ hostname: host } as any),
      retryAttempts: 0, // Disable retries
      connectionFactory: async (connection: Connection) => {
        const dbExists = await this.checkDatabaseExists(
          connection,
          dbNameCommunity({ hostname: host }),
        );
        if (!dbExists) {
          throw new ApiException(errorMessages.DATABASE_NOT_FOUND);
        }
        return connection;
      },
    };
    return options;
  }

  private async checkDatabaseExists(
    connection: Connection,
    dbName: string,
  ): Promise<boolean> {
    const listDatabasesResult = await connection.db.admin().listDatabases();
    const databaseNames = listDatabasesResult.databases.map((db) => db.name);
    return databaseNames.includes(dbName);
  }
}
