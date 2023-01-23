import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Document, Types } from 'mongoose';
import { EventLogTypeKey } from '../enums/event-log-type-key';
import { Exclude } from 'class-transformer';

export type EventLogTypeDocument = EventLogTypeKey & Document;

@Schema({ timestamps: true })
export class EventLogType {
  @Exclude()
  _id: Types.ObjectId;

  @ApiProperty()
  @Prop({
    type: String,
    required: true,
    unique: true,
    enum: Object.values(EventLogTypeKey),
  })
  key: string;

  @ApiProperty()
  @Prop({
    type: String,
    required: true,
  })
  label: string;

  @ApiProperty()
  @Prop({
    type: String,
    required: true,
  })
  description: string;

  @Exclude()
  @Prop()
  createdAt: Date;

  @Exclude()
  @Prop()
  updatedAt: Date;
}

export const EventLogTypeSchema = SchemaFactory.createForClass(EventLogType);
