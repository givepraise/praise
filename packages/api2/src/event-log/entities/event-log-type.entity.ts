import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { EventLogTypeKey } from '../enums/event-log-type-key';

export type EventLogTypeDocument = EventLogTypeKey & Document;

@Schema({ timestamps: true })
export class EventLogType {
  @Prop({
    type: String,
    required: true,
    unique: true,
    enum: Object.values(EventLogTypeKey),
  })
  key: string;

  @Prop({
    type: String,
    required: true,
  })
  label: string;

  @Prop({
    type: String,
    required: true,
  })
  description: string;
}

export const EventLogTypeSchema = SchemaFactory.createForClass(EventLogType);
