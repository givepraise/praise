import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ReportCacheItem } from './schemas/report-cache-item.schema';

@Injectable()
export class ReportsCacheService {
  constructor(
    @InjectModel(ReportCacheItem.name)
    private readonly reportsCacheModel: Model<ReportCacheItem>,
  ) {}

  /**
   * Retrieves a cache item by its key.
   *
   * @param key The key of the cache item.
   * @returns The value of the cache item if it exists and hasn't expired,
   *          or undefined otherwise.
   */
  async get(key: string) {
    const cacheItem = await this.reportsCacheModel.findOne({ key });
    if (!cacheItem) return undefined;

    const now = new Date();
    // if the item has no TTL (Time To Live) or hasn't expired, return its value
    if (!cacheItem.expiresAt || now < cacheItem.expiresAt) {
      return cacheItem.value;
    }

    // if the item has expired, delete it from the cache
    await this.reportsCacheModel.deleteOne({ key });
    return undefined;
  }

  /**
   * Stores a value in the cache with a given key and an optional TTL.
   *
   * @param key The key under which the value will be stored.
   * @param value The value to store.
   * @param ttl The Time To Live (TTL) of the cache item in seconds.
   *            If provided, the item will automatically be deleted after this time.
   *            If not provided, the item will live forever.
   */
  async set(key: string, value: any, ttl?: number) {
    // calculate the time when the item should expire
    const expiresAt = ttl ? new Date(Date.now() + ttl * 1000) : null;
    const cacheItem = new this.reportsCacheModel({ key, value, expiresAt });

    // if there is already an item with the same key, delete it
    await this.reportsCacheModel.deleteOne({ key });
    // then save the new item
    await cacheItem.save();
  }

  /**
   * Deletes a cache item by its key.
   *
   * @param key The key of the cache item to delete.
   */
  async delete(key: string) {
    await this.reportsCacheModel.deleteOne({ key });
  }
}
