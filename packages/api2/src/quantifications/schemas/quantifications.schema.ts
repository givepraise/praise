import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { Praise } from '@/praise/schemas/praise.schema';
import { Transform } from 'class-transformer';
import { User } from '@/users/schemas/users.schema';

export type QuantificationDocument = Quantification & Document;

@Schema({ timestamps: true })
export class Quantification {
  constructor(partial?: Partial<Quantification>) {
    if (partial) {
      Object.assign(this, partial);
    }
  }

  @Transform(({ value }) => value.toString())
  _id: Types.ObjectId;

  @Prop({ required: true, default: 0 })
  score: number;

  @Prop({ required: true, default: 0 })
  scoreRealized: number;

  @Prop({ required: true })
  dismissed: boolean;

  @Prop({ type: Types.ObjectId, ref: 'Praise' })
  @Transform(({ value }) => value.toString())
  duplicatePraise?: Praise;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  @Transform(({ value }) => value.toString())
  quantifier: User;

  @Prop({ type: Types.ObjectId, ref: 'Praise' })
  @Transform(({ value }) => value.toString())
  praise: Praise;

  @Prop({ type: Date })
  createdAt: Date;

  @Prop({ type: Date })
  updatedAt: Date;
}

const QuantificationsSchema = SchemaFactory.createForClass(Quantification);

export { QuantificationsSchema };
