import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Transform } from 'class-transformer';
import { model, Types } from 'mongoose';
import { mongoosePagination, Pagination } from 'mongoose-paginate-ts';
import { UserAccount } from '@/useraccounts/schemas/useraccounts.schema';
import { ApiResponseProperty } from '@nestjs/swagger';

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

  @ApiResponseProperty({
    example: 'for making edits in the welcome text',
  })
  @Prop({ required: true })
  reasonRaw: string;

  @ApiResponseProperty({
    example: 'for making edits in the welcome text',
  })
  @Prop({ required: true })
  reason: string;

  @ApiResponseProperty({
    example: 'DISCORD:666',
  })
  @Prop({ required: true })
  sourceId: string;

  @ApiResponseProperty({
    example: 'DISCORD',
  })
  @Prop({ required: true })
  sourceName: string;

  @ApiResponseProperty({
    example: 144,
  })
  @Prop({ required: true, default: 0 })
  score: number;

  @ApiResponseProperty({
    type: UserAccount,
  })
  @Prop({ type: Types.ObjectId, ref: 'UserAccount' })
  receiver: UserAccount;

  @ApiResponseProperty({
    type: UserAccount,
  })
  @Prop({ type: Types.ObjectId, ref: 'UserAccount' })
  giver: UserAccount;

  @ApiResponseProperty({
    type: UserAccount,
  })
  @Prop({ type: Types.ObjectId, ref: 'UserAccount' })
  forwarder: UserAccount;

  @ApiResponseProperty({
    type: [Types.ObjectId],
  })
  quantifications: Types.ObjectId[];

  @ApiResponseProperty()
  @Prop({ type: Date })
  createdAt: Date;

  @ApiResponseProperty()
  @Prop({ type: Date })
  updatedAt: Date;
}

export const PraiseSchema =
  SchemaFactory.createForClass(Praise).plugin(mongoosePagination);

export const PraiseModel = model<PraiseDocument, Pagination<PraiseDocument>>(
  'Praise',
  PraiseSchema,
);

PraiseSchema.virtual('quantifications', {
  ref: 'Quantification',
  localField: '_id',
  foreignField: 'praise',
});
