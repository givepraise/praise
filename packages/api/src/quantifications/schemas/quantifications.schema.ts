import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { Praise } from '../../praise/schemas/praise.schema';
import { User } from '../../users/schemas/users.schema';
import { ApiResponseProperty } from '@nestjs/swagger';
import { ExposeId } from '../../shared/decorators/expose-id.decorator';

export type QuantificationDocument = Quantification & Document;

@Schema({ timestamps: true })
export class Quantification {
  constructor(partial?: Partial<Quantification>) {
    if (partial) {
      Object.assign(this, partial);
    }
  }

  @ApiResponseProperty({
    example: '639b178f19296ee0f2d0585d',
    type: 'string',
  })
  @ExposeId()
  _id: Types.ObjectId;

  @Prop({ default: 0, type: 'number', required: true })
  @ApiResponseProperty({
    example: 144,
  })
  score: number;

  @Prop({ required: true, default: 0, type: 'number' })
  @ApiResponseProperty({
    example: 144,
  })
  scoreRealized: number;

  @Prop({ required: true, default: false, type: 'boolean' })
  @ApiResponseProperty({
    example: true,
    type: 'boolean',
  })
  dismissed: boolean;

  @Prop({ type: Types.ObjectId, ref: 'Praise', index: true, required: false })
  @ApiResponseProperty({
    example: '639b178f19296ee0f2d0585d',
    type: 'string',
  })
  @ExposeId()
  duplicatePraise?: Praise;

  @Prop({ type: Types.ObjectId, ref: 'User', index: true, required: true })
  @ApiResponseProperty({
    example: '639b178f19296ee0f2d0585d',
    type: 'string',
  })
  @ExposeId()
  quantifier: User | Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Praise', index: true, required: true })
  @ApiResponseProperty({
    example: '639b178f19296ee0f2d0585d',
    type: 'string',
  })
  @ExposeId()
  praise: Praise | Types.ObjectId;

  @Prop({ type: Date })
  @ApiResponseProperty({ example: '2021-06-01T00:00:00.000Z', type: Date })
  createdAt: Date;

  @Prop({ type: Date })
  @ApiResponseProperty({ example: '2021-06-01T00:00:00.000Z', type: Date })
  updatedAt: Date;
}

const QuantificationsSchema = SchemaFactory.createForClass(Quantification);
export { QuantificationsSchema };

export const QuantificationsExportSqlSchema = `
  _id VARCHAR, 
  praise VARCHAR, 
  quantifier VARCHAR, 
  score INTEGER, 
  "scoreRealized" DOUBLE, 
  dismissed BOOLEAN, 
  "duplicatePraise" VARCHAR, 
  "createdAt" TIMESTAMP, 
  "updatedAt" TIMESTAMP
`;
