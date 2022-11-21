import { Transform } from 'class-transformer';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { Date, Types } from 'mongoose';
import { PeriodStatusType } from '../interfaces/statusType.interface';
import { endDateValidators } from '../validators/periods.validators';

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
    type: [
      {
        type: String,
        enum: PeriodStatusType,
      },
    ],
    enum: PeriodStatusType,
    default: PeriodStatusType.OPEN,
  })
  status: string;

  @Prop({
    required: true,
    /** TODO */
    validator: (value: Date) => endDateValidators,
  })
  endDate: Date;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const PeriodSchema = SchemaFactory.createForClass(Period);
