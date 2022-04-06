import { Document } from 'mongoose';

export interface Migration {
  migrationName: string;
}

export interface MigrationDocument extends Migration, Document {}
