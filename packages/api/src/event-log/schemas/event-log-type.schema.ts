import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Document, Types } from 'mongoose';
import { EventLogTypeKey } from '../enums/event-log-type-key';
import { Exclude } from 'class-transformer';
import { IsEnum, IsString } from 'class-validator';

export type EventLogTypeDocument = EventLogTypeKey & Document;

@Schema({ timestamps: true })
export class EventLogType {
  @Exclude()
  _id: Types.ObjectId;

  @ApiProperty({ required: true, enum: EventLogTypeKey })
  @IsEnum(EventLogTypeKey)
  @Prop({
    type: 'string',
    required: true,
    unique: true,
    enum: EventLogTypeKey,
  })
  key: string;

  @ApiProperty({
    required: true,
    example: 'An action that changes user permissions',
    type: 'string',
    maxLength: 255,
  })
  @IsString()
  @Prop({
    type: 'string',
    required: true,
    maxlength: 255,
  })
  label: string;

  @ApiProperty({
    required: true,
    example: "A user's permissions were changed",
    type: 'string',
    maxLength: 255,
  })
  @IsString()
  @Prop({
    type: 'string',
    required: true,
    maxlength: 255,
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
