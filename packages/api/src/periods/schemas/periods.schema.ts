import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { PeriodStatusType } from '../enums/status-type.enum';
import { ExposeId } from '../../shared/decorators/expose-id.decorator';
import { ApiProperty, ApiResponseProperty } from '@nestjs/swagger';
import { IsString, Length } from 'class-validator';
import mongoosePaginate from 'mongoose-paginate-v2';

export type PeriodDocument = Period & Document;

@Schema({ timestamps: true })
export class Period {
  constructor(partial?: Partial<Period>) {
    if (partial) {
      Object.assign(this, partial);
    }
  }
  @ApiResponseProperty({ example: '621f802b813dbdba9eeaf7d7', type: 'string' })
  @ExposeId()
  _id: Types.ObjectId;

  @ApiProperty({ example: 'June 2021', type: 'string' })
  @IsString()
  @Length(3, 64)
  @Prop({ required: true, unique: true, minlength: 3, maxlength: 64 })
  name: string;

  @ApiResponseProperty({ enum: PeriodStatusType })
  @Prop({
    type: 'string',
    enum: PeriodStatusType,
    default: PeriodStatusType.OPEN,
    required: true,
  })
  status: PeriodStatusType;

  @ApiResponseProperty()
  @Prop({
    required: true,
    type: Date,
  })
  endDate: Date;

  @Prop({ type: Date })
  @ApiResponseProperty()
  createdAt: Date;

  @ApiResponseProperty()
  @Prop({ type: Date })
  updatedAt: Date;
}

export const PeriodSchema = SchemaFactory.createForClass(Period);

PeriodSchema.plugin(mongoosePaginate);

export const PeriodExportSqlSchema = `
  _id VARCHAR, 
  "name" VARCHAR, 
  status VARCHAR, 
  "endDate" TIMESTAMP, 
  "createdAt" TIMESTAMP, 
  "updatedAt" TIMESTAMP
`;
