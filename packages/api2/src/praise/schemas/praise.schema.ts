import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Transform } from 'class-transformer';
import { model, Types } from 'mongoose';
import { mongoosePagination, Pagination } from 'mongoose-paginate-ts';
import { UserAccount } from '@/useraccounts/schemas/useraccounts.schema';
import { ApiResponseProperty } from '@nestjs/swagger';
import { has } from 'lodash';
import { Quantification } from '@/quantifications/schemas/quantifications.schema';

export type PraiseDocument = Praise & Document;

@Schema({ timestamps: true })
export class Praise {
  constructor(partial?: Partial<Praise>) {
    if (partial) {
      Object.assign(this, partial);
      this.receiver = has(this.receiver, '_id')
        ? new UserAccount(this.receiver)
        : this.receiver;
      this.giver = has(this.giver, '_id')
        ? new UserAccount(this.giver)
        : this.giver;
      this.forwarder = has(this.forwarder, '_id')
        ? new UserAccount(this.forwarder)
        : this.forwarder;
      if (
        Array.isArray(this.quantifications) &&
        this.quantifications.length > 0
      ) {
        this.quantifications = this.quantifications.map((quantification) => {
          return has(quantification, '_id')
            ? new Quantification(quantification)
            : quantification;
        });
      }
    }
  }

  @ApiResponseProperty({
    example: '639b178f19296ee0f2d0585d',
  })
  @Transform(({ value }) => value.toString())
  _id: Types.ObjectId;

  @ApiResponseProperty({
    example: 'for making edits in the welcome text',
  })
  @Prop({ required: true, maxlength: 280 })
  reasonRaw: string;

  @ApiResponseProperty({
    example: 'for making edits in the welcome text',
  })
  @Prop({ required: true, maxlength: 280 })
  reason: string;

  @ApiResponseProperty({
    example: 'DISCORD:666',
  })
  @Prop({ required: true, maxlength: 100 })
  sourceId: string;

  @ApiResponseProperty({
    example: 'DISCORD',
  })
  @Prop({ required: true, maxlength: 100 })
  sourceName: string;

  @ApiResponseProperty({
    example: 144,
  })
  @Prop({ required: true, default: 0 })
  score: number;

  @ApiResponseProperty({
    example: '639b178f19296ee0f2d0585d',
  })
  @Prop({ type: Types.ObjectId, ref: 'UserAccount', index: true })
  receiver: UserAccount;

  @ApiResponseProperty({
    example: '639b178f19296ee0f2d0585d',
  })
  @Prop({ type: Types.ObjectId, ref: 'UserAccount', index: true })
  giver: UserAccount;

  @ApiResponseProperty({
    example: '639b178f19296ee0f2d0585d',
  })
  @Prop({ type: Types.ObjectId, ref: 'UserAccount', index: true })
  forwarder: UserAccount;

  @ApiResponseProperty({
    type: [Quantification],
  })
  quantifications: Quantification[];

  @ApiResponseProperty()
  @Prop({ type: Date })
  createdAt: Date;

  @ApiResponseProperty()
  @Prop({ type: Date })
  updatedAt: Date;
}

export const PraiseSchema =
  SchemaFactory.createForClass(Praise).plugin(mongoosePagination);

PraiseSchema.virtual('quantifications', {
  ref: 'Quantification',
  localField: '_id',
  foreignField: 'praise',
});

export const PraiseModel = model<PraiseDocument, Pagination<PraiseDocument>>(
  'Praise',
  PraiseSchema,
);
