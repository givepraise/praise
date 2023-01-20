import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { Praise } from '@/praise/schemas/praise.schema';
import { User } from '@/users/schemas/users.schema';
import { ApiResponseProperty } from '@nestjs/swagger';
import { ExposeId } from '@/shared/expose-id.decorator';

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
  })
  @ExposeId()
  _id: Types.ObjectId;

  @Prop({ default: 0 })
  @ApiResponseProperty({
    example: 144,
  })
  score: number;

  @Prop({ required: true, default: 0 })
  @ApiResponseProperty({
    example: 144,
  })
  scoreRealized: number;

  @Prop({ required: true })
  @ApiResponseProperty({
    example: true,
  })
  dismissed: boolean;

  @Prop({ type: Types.ObjectId, ref: 'Praise' })
  // TODO: This is not working, adding the example here causes a circular dependency error
  // @ApiResponseProperty({
  //   example: '639b178f19296ee0f2d0585d',
  // })
  @ExposeId()
  duplicatePraise?: Praise;

  @Prop({ type: Types.ObjectId, ref: 'User', index: true })
  @ApiResponseProperty({
    example: '639b178f19296ee0f2d0585d',
  })
  @ExposeId()
  quantifier: User | Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Praise', index: true })
  // TODO: This is not working, adding the example here causes a circular dependency error
  // @ApiResponseProperty({
  //   example: '639b178f19296ee0f2d0585d',
  // })
  @ExposeId()
  praise: Praise | Types.ObjectId;

  @ApiResponseProperty({
    example: '639b178f19296ee0f2d0585d',
  })
  @Prop({ type: Date })
  createdAt: Date;

  @ApiResponseProperty()
  @Prop({ type: Date })
  updatedAt: Date;
}

const QuantificationsSchema = SchemaFactory.createForClass(Quantification);
export { QuantificationsSchema };
