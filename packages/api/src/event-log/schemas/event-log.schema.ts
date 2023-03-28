import { ExposeId } from '../../shared/decorators/expose-id.decorator';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Document, model, Types } from 'mongoose';
import { mongoosePagination, Pagination } from 'mongoose-paginate-ts';
import { EventLogType } from './event-log-type.schema';

import { Type } from 'class-transformer';
import { IsString, ValidateNested } from 'class-validator';
import { UserAccountNoUserId } from '../../useraccounts/schemas/useraccounts.schema';

export type EventLogDocument = EventLog & Document;

@Schema({ timestamps: true })
export class EventLog {
  constructor(partial?: Partial<EventLog>) {
    if (partial) {
      Object.assign(this, partial);
      if (partial.useraccount) {
        this.useraccount = new UserAccountNoUserId(partial.useraccount);
      }
    }
  }

  @ApiProperty({
    example: '621f802b813dbdba9eeaf7d7',
    required: true,
    type: 'string',
  })
  @IsString()
  @ExposeId()
  _id: Types.ObjectId;

  @ApiProperty({ example: '621f802b813dbdba9eeaf7d7', type: 'string' })
  @ExposeId()
  @Prop({
    type: Types.ObjectId,
    ref: 'User',
    index: true,
    required: false,
  })
  user?: Types.ObjectId;

  @ApiProperty({ type: UserAccountNoUserId })
  @ValidateNested()
  @Type(() => UserAccountNoUserId)
  @Prop({
    type: Types.ObjectId,
    ref: 'UserAccount',
    index: true,
    required: false,
  })
  useraccount?: Types.ObjectId | UserAccountNoUserId;

  @ApiProperty({ example: '621f802b813dbdba9eeaf7d7', type: 'string' })
  @ExposeId()
  @Prop({
    type: Types.ObjectId,
    ref: 'ApiKey',
    index: true,
    required: false,
  })
  apiKey?: Types.ObjectId;

  // "Related Period" of an eventlog - only used for quantification events
  //    which are restricted to ADMIN users when period is active
  @ApiProperty({ example: '621f802b813dbdba9eeaf7d7', type: 'string' })
  @ExposeId()
  @Prop({
    type: Types.ObjectId,
    ref: 'Period',
    index: true,
    required: false,
  })
  period?: Types.ObjectId;

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

  @ApiProperty({
    example: 'A description of the event ',
    required: true,
    type: 'string',
  })
  @IsString()
  @Prop({ type: String, required: true })
  description: string;

  @ApiProperty({
    example: '2023-03-01T22:51:20.012Z',
    required: true,
    type: Date,
  })
  @Prop({ type: Date })
  createdAt: Date;

  @ApiProperty({
    example: '2023-03-01T22:51:20.012Z',
    required: true,
    type: Date,
  })
  @Prop({ type: Date })
  updatedAt: Date;
}

export const EventLogSchema =
  SchemaFactory.createForClass(EventLog).plugin(mongoosePagination);

export const EventLogModel = model<EventLog, Pagination<EventLog>>(
  'EventLog',
  EventLogSchema,
);
