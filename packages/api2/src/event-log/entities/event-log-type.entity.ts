import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { EventLogTypeKey } from '../interfaces';

export type EventLogTypeDocument = EventLogType & Document;

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

// export const EventLogTypeModel = model<
//   EventLogTypeDocument,
//   Pagination<EventLogTypeDocument>
// >('EventLogType', eventLogTypeSchema);

export const EventLogTypeSchema = SchemaFactory.createForClass(EventLogType);
