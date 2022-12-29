import { UserAccount } from '@/useraccounts/schemas/useraccounts.schema';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { Praise } from '@/praise/schemas/praise.schema';
import { QuantificationsService } from '../quantifications.service';
import { Transform } from 'class-transformer';

export type QuantificationDocument = Quantification & Document;

@Schema({ timestamps: true })
export class Quantification {
  constructor(
    public quantificationsService: QuantificationsService,
    partial?: Partial<Quantification>,
  ) {
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

const QuantificationsSchema = SchemaFactory.createForClass(Quantification);

// QuantificationsSchema.virtual('scoreRealized').get(function (
//   this: Quantification,
// ) {
//   return this.quantificationsService.calculateQuantificationScore(this);
// });

export { QuantificationsSchema };
