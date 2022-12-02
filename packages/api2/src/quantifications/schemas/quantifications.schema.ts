import { UserAccount } from '@/useraccounts/schemas/useraccounts.schema';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { Praise } from 'src/praise/schemas/praise.schema';

export type QuantificationDocument = Quantification & Document;

@Schema({ timestamps: true })
export class Quantification {
  constructor(partial?: Partial<Quantification>) {
    if (partial) {
      Object.assign(this, partial);
    }
  }

  @Prop({ required: true, default: 0 })
  score: number;

  @Prop({ required: true })
  dismissed: boolean;

  @Prop({ type: Types.ObjectId, ref: 'Praise' })
  duplicatePraise?: Praise;

  @Prop({ type: Types.ObjectId, ref: 'UserAccount' })
  quantifier: UserAccount;

  @Prop({ type: Types.ObjectId, ref: 'Praise' })
  praise: Praise;

  @Prop({ type: Date })
  createdAt: Date;

  @Prop({ type: Date })
  updatedAt: Date;
}

export const QuantificationsSchema =
  SchemaFactory.createForClass(Quantification);
