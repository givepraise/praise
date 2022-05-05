import { Document, Types } from 'mongoose';

export interface EventLog {
  user: Types.ObjectId;
  type: Types.ObjectId;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface EventLogDocument extends EventLog, Document {}

export interface EventLogDto {
  user: string;
  type: EventLogTypeDto;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface EventLogType {
  key: string;
  label: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface EventLogTypeDocument extends EventLogType, Document {}

export interface EventLogTypeDto {
  key: string;
  label: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}
