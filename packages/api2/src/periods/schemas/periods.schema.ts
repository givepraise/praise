import { Transform } from 'class-transformer';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { Types, model } from 'mongoose';
import { PeriodStatusType } from '../enums/status-type.enum';
import { mongoosePagination } from 'mongoose-paginate-ts';
import { PaginatedPeriodModel } from '../interfaces/paginated-period.interface';

export type PeriodDocument = Period & Document;

@Schema({ timestamps: true })
export class Period {
  constructor(partial?: Partial<Period>) {
    if (partial) {
      Object.assign(this, partial);
    }
  }

  @Transform(({ value }) => value.toString())
  _id: Types.ObjectId;

  @Prop({ required: true, unique: true, minlength: 3, maxlength: 64 })
  name: string;

  @Prop({
    type: String,
    enum: PeriodStatusType,
    default: PeriodStatusType.OPEN,
  })
  status: string;

  @Prop({
    required: true,
    type: Date,
    /** TODO validator */
  })
  endDate: Date;

  @Prop({ type: Date })
  createdAt: Date;

  @Prop({ type: Date })
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
