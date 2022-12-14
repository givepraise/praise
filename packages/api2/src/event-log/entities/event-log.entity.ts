import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, model, Types } from 'mongoose';
import { mongoosePagination, Pagination } from 'mongoose-paginate-ts';

export type EventLogDocument = EventLog & Document;
export type EventLogModel = Pagination<EventLogDocument>;

@Schema({ timestamps: true })
export class EventLog {
  constructor(partial?: Partial<EventLog>) {
    if (partial) {
      Object.assign(this, partial);
    }
  }

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

export const EventLogSchema =
  SchemaFactory.createForClass(EventLog).plugin(mongoosePagination);

export const PaginatedEventLogModel = model<
  EventLogDocument,
  Pagination<EventLogDocument>
>('EventLog', EventLogSchema);
