import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types, model } from 'mongoose';
import { PeriodStatusType } from '../enums/status-type.enum';
import { mongoosePagination } from 'mongoose-paginate-ts';
import { PaginatedPeriodModel } from '../interfaces/paginated-period.interface';
import { ExposeId } from '@/shared/expose-id.decorator';
import { ApiProperty, ApiResponseProperty } from '@nestjs/swagger';
import { IsString, Length } from 'class-validator';

export type PeriodDocument = Period & Document;

@Schema({ timestamps: true })
export class Period {
  constructor(partial?: Partial<Period>) {
    if (partial) {
      Object.assign(this, partial);
    }
  }
  @ApiResponseProperty({ example: '621f802b813dbdba9eeaf7d7' })
  @ExposeId()
  _id: Types.ObjectId;

  @Prop({ required: true, unique: true, minlength: 3, maxlength: 64 })
  @ApiProperty({ example: 'June 2021' })
  @IsString()
  @Length(3, 64)
  name: string;

  @Prop({
    type: String,
    enum: PeriodStatusType,
    default: PeriodStatusType.OPEN,
  })
  @ApiResponseProperty({ example: 'OPEN' })
  status: string;

  @Prop({
    required: true,
    type: Date,
    /** TODO validator */
  })
  @ApiResponseProperty()
  endDate: Date;

  @Prop({ type: Date })
  @ApiResponseProperty()
  createdAt: Date;

  @Prop({ type: Date })
  @ApiResponseProperty()
  updatedAt: Date;
}

export const PeriodSchema =
  SchemaFactory.createForClass(Period).plugin(mongoosePagination);

PeriodSchema.statics.getLatest = function (): PeriodDocument {
  return this.findOne({}).sort({ endDate: -1 });
};

export const PeriodModel = model<PeriodDocument, PaginatedPeriodModel>(
  'Period',
  PeriodSchema,
);
