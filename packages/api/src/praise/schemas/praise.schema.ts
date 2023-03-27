import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Type } from 'class-transformer';
import { model, Types } from 'mongoose';
import { mongoosePagination, Pagination } from 'mongoose-paginate-ts';
import { UserAccount } from '../../useraccounts/schemas/useraccounts.schema';
import { ApiResponseProperty } from '@nestjs/swagger';
import { has } from 'lodash';
import { Quantification } from '../../quantifications/schemas/quantifications.schema';
import { ExposeId } from '../../shared/decorators/expose-id.decorator';
import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

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
    type: 'string',
  })
  @ExposeId()
  _id: Types.ObjectId;

  @ApiResponseProperty({
    example: 'for making edits in the welcome text',
    type: 'string',
  })
  @Prop({ required: true, minlength: 5, maxlength: 280 })
  @IsString()
  @MinLength(5)
  @MaxLength(280)
  reasonRaw: string;

  @ApiResponseProperty({
    example: 'for making edits in the welcome text',
    type: 'string',
  })
  @Prop({ required: true, minlength: 5, maxlength: 280 })
  @IsString()
  @MinLength(5)
  @MaxLength(280)
  reason: string;

  @ApiResponseProperty({
    example: 'DISCORD:810180621930070088:810180622336262195',
    type: 'string',
  })
  @Prop({ required: true, maxlength: 100 })
  @IsString()
  @MaxLength(100)
  sourceId: string;

  @ApiResponseProperty({
    example:
      'DISCORD:Token%20Engineering%20Commons:%F0%9F%99%8F%EF%BD%9Cpraise',
    type: 'string',
  })
  @Prop({ required: true, maxlength: 100 })
  @IsString()
  @MaxLength(100)
  sourceName: string;

  @ApiResponseProperty({
    example: 144,
    type: 'number',
  })
  @Prop({ required: true, default: 0 })
  score: number;

  @ApiResponseProperty({
    type: UserAccount,
  })
  @Prop({ type: Types.ObjectId, ref: 'UserAccount', index: true })
  @Type(() => UserAccount)
  @IsNotEmpty()
  receiver: UserAccount | Types.ObjectId;

  @ApiResponseProperty({
    type: UserAccount,
  })
  @Prop({ type: Types.ObjectId, ref: 'UserAccount', index: true })
  @Type(() => UserAccount)
  @IsNotEmpty()
  giver: UserAccount | Types.ObjectId;

  @ApiResponseProperty({
    type: UserAccount,
  })
  @Prop({ type: Types.ObjectId, ref: 'UserAccount', index: true })
  @Type(() => UserAccount)
  forwarder: UserAccount | Types.ObjectId;

  @ApiResponseProperty({
    type: [Quantification],
  })
  @Type(() => Quantification)
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

export const PraiseExportSqlSchema = `
  _id VARCHAR, 
  giver VARCHAR, 
  forwarder VARCHAR, 
  receiver VARCHAR, 
  reason VARCHAR, 
  "reasonRaw" VARCHAR, 
  score DOUBLE, 
  "sourceId" VARCHAR, 
  "sourceName" VARCHAR, 
  "createdAt" TIMESTAMP, 
  "updatedAt" TIMESTAMP
`;
