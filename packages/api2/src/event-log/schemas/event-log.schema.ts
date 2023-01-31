import { ExposeId } from '@/shared/expose-id.decorator';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Document, model, Types } from 'mongoose';
import { mongoosePagination, Pagination } from 'mongoose-paginate-ts';
import { EventLogType } from './event-log-type.schema';
import { Type } from 'class-transformer';
import { IsString, ValidateNested } from 'class-validator';

export type EventLogDocument = EventLog & Document;

@Schema({ timestamps: true })
export class EventLog {
  constructor(partial?: Partial<EventLog>) {
    if (partial) {
      Object.assign(this, partial);
    }
  }

  @ApiProperty({ example: '621f802b813dbdba9eeaf7d7', required: true })
  @IsString()
  @ExposeId()
  _id: Types.ObjectId;

  @ApiProperty({ example: '621f802b813dbdba9eeaf7d7' })
  @ExposeId()
  @Prop({
    type: Types.ObjectId,
    ref: 'User',
    index: true,
  })
  user: Types.ObjectId;

  @ApiProperty({ example: '621f802b813dbdba9eeaf7d7' })
  @ExposeId()
  @Prop({
    type: Types.ObjectId,
    ref: 'UserAccount',
    index: true,
  })
  useraccount: Types.ObjectId;

  @ApiProperty({ example: '621f802b813dbdba9eeaf7d7' })
  @ExposeId()
  @Prop({
    type: Types.ObjectId,
    ref: 'ApiKey',
    index: true,
  })
  apiKey: Types.ObjectId;

  // "Related Period" of an eventlog - only used for quantification events
  //    which are restricted to ADMIN users when period is active
  @ApiProperty({ example: '621f802b813dbdba9eeaf7d7' })
  @ExposeId()
  @Prop({
    type: Types.ObjectId,
    ref: 'Period',
    index: true,
  })
  period: Types.ObjectId;

  @ApiProperty({ type: EventLogType, required: true })
  @ValidateNested()
  @Type(() => EventLogType)
  @Prop({
    type: Types.ObjectId,
    ref: 'EventLogType',
    required: true,
    index: true,
  })
  type: Types.ObjectId | EventLogType;

  @ApiProperty({ example: 'A description of teh event ', required: true })
  @IsString()
  @Prop({ type: String, required: true })
  description: string;
}

export const EventLogSchema =
  SchemaFactory.createForClass(EventLog).plugin(mongoosePagination);

export const EventLogModel = model<
  EventLogDocument,
  Pagination<EventLogDocument>
>('EventLog', EventLogSchema);
