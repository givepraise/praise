import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';

// Extending Mongoose Document to include ReportCacheItem
export type ReportCacheItemDocument = ReportCacheItem & mongoose.Document;

// Mongoose schema for cache items
@Schema({ timestamps: true })
export class ReportCacheItem {
  @Prop({ type: String, required: true, unique: true }) // Unique key for cache item
  key: string;

  @Prop({ type: mongoose.Schema.Types.Mixed, required: true }) // Value of cache item
  value: any;

  @Prop({ type: Date }) // Optional expiration date
  expiresAt: Date;
}

// Generating Mongoose model from the schema
export const ReportCacheItemSchema =
  SchemaFactory.createForClass(ReportCacheItem);
