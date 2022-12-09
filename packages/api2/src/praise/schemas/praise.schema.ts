import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Transform } from 'class-transformer';
import { model, Types } from 'mongoose';
import { Quantification } from '@/quantifications/schemas/quantifications.schema';
import { mongoosePagination, Pagination } from 'mongoose-paginate-ts';
import { UserAccount } from '@/useraccounts/schemas/useraccounts.schema';

export type PraiseDocument = Praise & Document;

@Schema({ timestamps: true })
export class Praise {
  constructor(partial?: Partial<Praise>) {
    if (partial) {
      Object.assign(this, partial);
    }
  }

  @Transform(({ value }) => value.toString())
  _id: Types.ObjectId;

  @Prop({ required: true })
  reason: string;

  @Prop({ required: true })
  reasonRealized: string;

  @Prop({ required: true })
  sourceId: string;

  @Prop({ required: true })
  sourceName: string;

  @Prop({ required: true, default: 0 })
  score: number;

  @Prop({ type: Types.ObjectId, ref: 'UserAccount' })
  receiver: UserAccount;

  @Prop({ type: Types.ObjectId, ref: 'UserAccount' })
  giver: UserAccount;

  @Prop({ type: Types.ObjectId, ref: 'UserAccount' })
  forwarder: UserAccount;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Quantification' }] })
  quantifications: Quantification[];

  @Prop({ type: Date })
  createdAt: Date;

  @Prop({ type: Date })
  updatedAt: Date;
}

export const PraiseSchema =
  SchemaFactory.createForClass(Praise).plugin(mongoosePagination);

export const PraiseModel = model<PraiseDocument, Pagination<PraiseDocument>>(
  'Praise',
  PraiseSchema,
);
