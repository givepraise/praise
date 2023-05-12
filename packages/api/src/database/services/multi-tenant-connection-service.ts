/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { HOSTNAME_TEST } from '../../constants/constants.provider';
import { Inject, Injectable, Scope } from '@nestjs/common';
import { ModuleRef, REQUEST } from '@nestjs/core';
import {
  MongooseModuleOptions,
  MongooseOptionsFactory,
} from '@nestjs/mongoose';
import { getDbUrl } from '../utils/get-db-url';
import { Connection } from 'mongoose';
import { hostNameToDbName } from '../utils/host-name-to-db-name';
import { ApiException } from '../../shared/exceptions/api-exception';
import { errorMessages } from '../../shared/exceptions/error-messages';
import { ConnectionCacheService } from './connection-cache.service';
import { logger } from '../../shared/logger';

/**
 * The MultiTenantConnectionService implements a multi-tenant database connection
 * strategy where each praise community (tenant) has their own database. On each
 * request, the host is used to determine which database to connect to. Database
 * connections are cached for 1 hour by default. This can be adjusted as needed.
 */
@Injectable({ scope: Scope.REQUEST })
export class MultiTenantConnectionService implements MongooseOptionsFactory {
  private connectionCacheService: ConnectionCacheService;

  constructor(
    @Inject(REQUEST) private readonly request: any,
    private moduleRef: ModuleRef,
  ) {
    this.connectionCacheService = this.moduleRef.get(ConnectionCacheService, {
      strict: false,
    });
  }

  async createMongooseOptions(): Promise<MongooseModuleOptions> {
    const host = this.getHostFromRequest();
    const dbUrl = getDbUrl(host);

    // Check if connection already exists
    const existingConnection = await this.connectionCacheService.get(host);
    if (existingConnection) {
      logger.debug(`Using existing connection for for ${host}`);
      return {
        uri: dbUrl,
        connectionFactory: () => existingConnection,
      };
    }

    // If connection does not exist, create a new one
    logger.debug(`Connecting to database for ${host}`);
    return {
      uri: dbUrl,
      retryAttempts: 0, // Disable retries
      connectionFactory: async (connection: Connection) => {
        const dbExists = await this.checkDatabaseExists(
          connection,
          hostNameToDbName(host),
        );

        // If database does not exist, throw an error. This occurs when a
        // user tries to access a community that does not exist.
        if (!dbExists) {
          throw new ApiException(errorMessages.DATABASE_NOT_FOUND);
        }

        // Cache connection
        this.connectionCacheService.set(host, connection);
        return connection;
      },
    };
  }

  getHostFromRequest(): string {
    return process.env.NODE_ENV === 'testing'
      ? HOSTNAME_TEST
      : this.request.headers['host'].split(':')[0];
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
