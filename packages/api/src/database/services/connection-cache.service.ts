import { Injectable, Scope } from '@nestjs/common';
import { Connection } from 'mongoose';

/**
 * The ConnectionCacheService implements a simple cache for database connections.
 * By default, connections are cached for 1 hour. This can be adjusted as needed.
 */
@Injectable({ scope: Scope.DEFAULT })
export class ConnectionCacheService {
  private cache: Map<string, { connection: Connection; timestamp: number }> =
    new Map();
  private ttl: number = 1000 * 60 * 60; // 1 hour TTL, adjust as needed

  async get(host: string): Promise<Connection | undefined> {
    const cached = this.cache.get(host);

    if (cached) {
      const age = Date.now() - cached.timestamp;
      if (age < this.ttl) {
        return cached.connection;
      } else {
        // connection is too old, remove it from the cache
        this.cache.delete(host);
      }
    }

    return;
  }

  async set(host: string, connection: Connection): Promise<void> {
    this.cache.set(host, { connection, timestamp: Date.now() });
  }
}
