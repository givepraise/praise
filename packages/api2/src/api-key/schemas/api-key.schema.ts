import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty, ApiResponseProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { Document } from 'mongoose';
import { ApiKeyUserRole } from '../enums/api-key-user-roles';

export type ApiKeyDocument = ApiKey & Document;

@Schema({ timestamps: true })
export class ApiKey {
  constructor(partial?: Partial<ApiKey>) {
    if (partial) {
      Object.assign(this, partial);
    }
  }

  @ApiProperty()
  @ApiResponseProperty({
    example: '89f7edbd',
  })
  @Prop({ type: String, required: true })
  name: string;

  @ApiProperty()
  @ApiResponseProperty({
    example: 'Telegram bot API key',
  })
  @Prop({ type: String, required: true })
  description: string;

  @ApiProperty()
  @ApiResponseProperty({
    example: '$2b$10$hfRNI.V7ewuN/K.5eSt6oelaQ.FDj6irfUNR9wkKnL/qsNT23aE4i',
  })
  @Prop({ type: String, required: true })
  hash: string;

  @ApiProperty({ enum: ApiKeyUserRole, required: true })
  @ApiResponseProperty({
    example: 'READ',
  })
  @Prop({ enum: ApiKeyUserRole, required: true })
  @IsEnum(ApiKeyUserRole)
  role: ApiKeyUserRole;

  @ApiProperty()
  @Prop({ type: Date })
  createdAt: Date;

  @ApiProperty()
  @Prop({ type: Date })
  updatedAt: Date;
}

export const ApiKeySchema = SchemaFactory.createForClass(ApiKey);
