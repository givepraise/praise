import { AuthRole } from '@/auth/enums/auth-role.enum';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty, ApiResponseProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { Document, Types } from 'mongoose';
import { ExposeId } from '@/shared/expose-id.decorator';

export type ApiKeyDocument = ApiKey & Document;

@Schema({ timestamps: true })
export class ApiKey {
  constructor(partial?: Partial<ApiKey>) {
    if (partial) {
      Object.assign(this, partial);
    }
  }

  @ExposeId()
  _id: Types.ObjectId;

  @ApiResponseProperty({
    example: '89f7edbd',
  })
  @Prop({ type: String, required: true })
  name: string;

  @ApiProperty({
    example: 'My API Key',
  })
  @IsNotEmpty()
  @IsString()
  @Prop({ type: String, required: true, minlength: 3, maxlength: 255 })
  description: string;

  @ApiResponseProperty({
    example: '$2b$10$hfRNI.V7ewuN/K.5eSt6oelaQ.FDj6irfUNR9wkKnL/qsNT23aE4i',
  })
  @Prop({ type: String, required: true })
  hash: string;

  @ApiProperty({ enum: AuthRole, required: true })
  @IsEnum(AuthRole)
  @Prop({ enum: AuthRole, required: true })
  role: AuthRole;

  @ApiResponseProperty()
  @Prop({ type: Date })
  createdAt: Date;

  @ApiResponseProperty()
  @Prop({ type: Date })
  updatedAt: Date;
}

export const ApiKeySchema = SchemaFactory.createForClass(ApiKey);
