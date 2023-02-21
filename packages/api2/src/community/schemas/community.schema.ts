import { ExposeId } from '@/shared/decorators/expose-id.decorator';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Document, model, Types } from 'mongoose';
import { mongoosePagination, Pagination } from 'mongoose-paginate-ts';
import { IsBoolean, IsString, ValidateNested } from 'class-validator';
import { CommunityBotStatus } from '../enums/community-bot-status';

export type CommunityDocument = Community & Document;


@Schema({ timestamps: true })
export class Community {
  constructor(partial?: Partial<Community>) {
    if (partial) {
      Object.assign(this, partial);
    }
  }

  @ApiProperty({ example: '621f802b813dbdba9eeaf7b4', required: true })
  @IsString()
  @ExposeId()
  _id: Types.ObjectId;

  @ApiProperty({ example: 'banklessdao.givepraise.xyz', required: true })
  @IsString()
  @Prop({ type: String, required: true })
  hostname: string;

  @ApiProperty({ example: 'BanklessDAO', required: true })
  @IsString()
  @Prop({ type: String, required: true })
  name: string;

  @ApiProperty({ example: '0x123..', required: true })
  @IsString()
  @Prop({ type: String, required: true })
  creator: string;

  @ApiProperty({ example: '[0x123.., 0x345..]', required: true })
  @IsString()
  @Prop({ type: [String], required: true })
  owners: string;

  @ApiProperty({ example: '0980987846534' })
  @IsString()
  @Prop({ type: String })
  discordGuildId ?: string;

  @ApiProperty({ example: 'oiujoiuoo8u' })
  @IsString()
  @Prop({ type: String })
  discordLinkNonce ?: string;


  @ApiProperty({ example: true })
  @IsBoolean()
  @Prop({ type: Boolean, default: true })
  // In this step all communities should be public, but we may allow premium communities be private
  isPublic : boolean;

  @ApiProperty({ example: 'NOT_SET | PENDING | ACTIVE | DEACTIVE' })
  @IsString()
  @Prop({
    type: String,
    enum: Object.values(CommunityBotStatus)
  })
  discordLinkState ?: string;

}

export const CommunitySchema =
  SchemaFactory.createForClass(Community).plugin(mongoosePagination);

export const CommunityModel = model<Community, Pagination<Community>>(
  'Community',
  CommunitySchema
);
