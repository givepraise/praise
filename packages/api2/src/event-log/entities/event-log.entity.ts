import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type EventLogDocument = EventLog & Document;

@Schema({ timestamps: true })
export class EventLog {
  @Prop({
    type: Types.ObjectId,
    ref: 'User',
    index: true,
  })
  user: Types.ObjectId;

  @Prop({
    type: Types.ObjectId,
    ref: 'UserAccount',
    index: true,
  })
  useraccount: Types.ObjectId;

  // "Related Period" of an eventlog - only used for quantification events
  //    which are restricted to ADMIN users when period is active
  @Prop({
    type: Types.ObjectId,
    ref: 'Period',
    index: true,
  })
  period: Types.ObjectId;

  @Prop({
    type: Types.ObjectId,
    ref: 'EventLogType',
    required: true,
    index: true,
  })
  type: Types.ObjectId;

  @Prop({ type: String, required: true })
  description: string;
}

// eventLogSchema.plugin(mongoosePagination);

export const EventLogSchema = SchemaFactory.createForClass(EventLog);

// export const EventLogModel = model<
//   EventLogDocument,
//   Pagination<EventLogDocument>
// >('EventLog', eventLogSchema);
