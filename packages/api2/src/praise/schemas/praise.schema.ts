import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Transform } from 'class-transformer';
import mongoose, { model, Types } from 'mongoose';
import { Quantification } from 'src/quantifications/schemas/quantifications.schema';
import { UserAccount } from '../../useraccounts/schemas/useraccounts.schema';
import { mongoosePagination, Pagination } from 'mongoose-paginate-ts';

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
}

export const PraiseSchema =
  SchemaFactory.createForClass(Praise).plugin(mongoosePagination);

export const PaginatedPraiseModel = model<
  PraiseDocument,
  Pagination<PraiseDocument>
>('Praise', PraiseSchema);
