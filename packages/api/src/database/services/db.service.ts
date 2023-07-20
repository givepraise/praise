import { Injectable, Scope, Inject } from '@nestjs/common';
import { Connection, PaginateModel } from 'mongoose';
import { InjectConnection } from '@nestjs/mongoose';
import { REQUEST } from '@nestjs/core';
import { Model } from 'mongoose';
import { HOSTNAME_TEST } from '../../constants/constants.provider';
import { hostNameToDbName } from '../utils/host-name-to-db-name';

/**
 * This service is responsible for managing database connections and model retrieval.
 * It is request-scoped, meaning a new instance is created for every request.
 */
@Injectable({ scope: Scope.REQUEST })
export class DbService {
  private readonly connection: Connection;

  /**
   * Initializes a new instance of DbService
   * @param {Connection} conn - The original database connection
   * @param {any} request - The current HTTP request
   */
  constructor(
    @InjectConnection() conn: Connection,
    @Inject(REQUEST) private readonly request: any,
  ) {
    // If there is no host header, assume connection has already been correctly configured
    if (!request?.headers?.host) {
      this.connection = conn;
      return;
    }

    // Get host from request and map it to a database name
    const host = this.getHostFromRequest();
    const db = hostNameToDbName(host);

    // Use the given database for this connection
    this.connection = conn.useDb(db);
  }

  /**
   * Retrieves a Mongoose model. If the model has already been compiled, it returns the existing model.
   * Otherwise, it compiles a new model and returns it.
   * @param {string} name - The name of the model
   * @param {any} schema - The schema of the model
   * @returns {Model<TDocument>} - The requested Mongoose model
   */
  getModel<TDocument>(name: string, schema: any): Model<TDocument> {
    // If the model has already been compiled, return it
    if (this.connection.models[name]) {
      return this.connection.models[name];
    }

    // Otherwise, compile the model and return it
    return this.connection.model<TDocument>(name, schema);
  }

  /**
   * Retrieves a paginated Mongoose model. If the model has already been compiled, it returns the existing model.
   * Otherwise, it compiles a new model and returns it.
   * @param {string} name - The name of the model
   * @param {any} schema - The schema of the model
   * @returns {PaginateModel<TDocument>} - The requested paginated Mongoose model
   */
  getPaginateModel<TDocument>(
    name: string,
    schema: any,
  ): PaginateModel<TDocument> {
    // If the model has already been compiled, return it
    if (this.connection.models[name]) {
      return this.connection.models[name] as PaginateModel<TDocument>;
    }

    // Otherwise, compile the model and return it
    return this.connection.model<TDocument>(
      name,
      schema,
    ) as PaginateModel<TDocument>;
  }

  /**
   * Retrieves the hostname from the current request.
   * @returns {string} - The hostname
   */
  getHostFromRequest(): string {
    return process.env.NODE_ENV === 'testing'
      ? HOSTNAME_TEST
      : this.request.headers['host'].split(':')[0];
  }
}
