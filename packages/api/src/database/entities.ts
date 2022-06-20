import { Schema, model } from 'mongoose';
import { MigrationDocument } from './types';

/**
 * Database schema for Migration is *cloned* from the actual documents produced by umzug
 */
const migrationSchema = new Schema<MigrationDocument>(
  {
    migrationName: { type: String, required: true },
  },
  {
    collection: 'migrations',
  }
);

const MigrationModel = model<MigrationDocument>('Migration', migrationSchema);

export { MigrationModel };
