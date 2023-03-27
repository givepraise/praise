import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Document, Types } from 'mongoose';
import { EventLogTypeKey } from '../enums/event-log-type-key';
import { Exclude } from 'class-transformer';
import { IsString } from 'class-validator';

export type EventLogTypeDocument = EventLogTypeKey & Document;

@Schema({ timestamps: true })
export class EventLogType {
  @Exclude()
  _id: Types.ObjectId;

  @ApiProperty({ required: true, example: 'PERMISSION', type: 'string' })
  @IsString()
  @Prop({
    type: 'string',
    required: true,
    unique: true,
    enum: Object.values(EventLogTypeKey),
  })
  key: string;

  @ApiProperty({
    required: true,
    example: 'An action that changes user permissions',
    type: 'string',
  })
  @IsString()
  @Prop({
    type: 'string',
    required: true,
  })
  label: string;

  @ApiProperty({
    required: true,
    example: "A user's permissions were changed",
    type: 'string',
  })
  @IsString()
  @Prop({
    type: 'string',
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
