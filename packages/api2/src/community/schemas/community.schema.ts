import { ExposeId } from '../../shared/decorators/expose-id.decorator';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Document, model, Types } from 'mongoose';
import { mongoosePagination, Pagination } from 'mongoose-paginate-ts';
import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
} from 'class-validator';
import { DiscordLinkState } from '../enums/discord-link-state';
import { IsEthAddress } from '../../shared/validators/is-eth-address.validator';
import { isValidCommunityName } from '../utils/is-valid-community-name';
import { isValidOwners } from '../utils/is-valid-owners';
import { isValidHostname } from '../utils/is-valid-hostname';

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

  @ApiProperty({
    example: 'banklessdao.givepraise.xyz',
    required: true,
    minLength: 6,
    maxLength: 64,
  })
  @IsString()
  @Prop({
    type: String,
    required: true,
    minlength: 6,
    maxlength: 64,
    validate: {
      validator: (name: string) => Promise.resolve(isValidHostname(name)),
      message: 'Invalid hostname.',
    },
  })
  hostname: string;

  @ApiProperty({
    example: 'BanklessDAO',
    required: true,
    minLength: 4,
    maxLength: 20,
  })
  @IsString()
  @Prop({
    type: String,
    required: true,
    minlength: 4,
    maxlength: 20,
    unique: true,
    validate: {
      validator: (name: string) => Promise.resolve(isValidCommunityName(name)),
      message:
        'Invalid name, only alphanumeric characters, underscores, dots, and hyphens are allowed.',
    },
  })
  name: string;

  @ApiProperty({
    example: 'john.smith@banklessDao.com',
    required: true,
    maxLength: 256,
  })
  @IsString()
  @IsEmail()
  @Prop({ type: String, required: true, minlength: 8, maxlength: 256 })
  email: string;

  @ApiProperty({ example: '0x123..', required: true, maxLength: 42 })
  @IsString()
  @IsEthAddress()
  @Prop({ type: String, required: true, length: 42 })
  creator: string;

  @ApiProperty({
    example: ['0x123..', '0x345..'],
    type: ['string'],
    required: true,
  })
  @IsArray()
  // owners should contain creator so it has at least one owner
  @ArrayMinSize(1)
  @Prop({
    type: [String],
    required: true,
    length: 42,
    validate: {
      validator: (owners: string[]) => Promise.resolve(isValidOwners(owners)),
    },
  })
  owners: string[];

  @ApiProperty({ example: '0980987846534', required: false, maxLength: 32 })
  @IsOptional()
  @IsString()
  @Prop({ type: String, required: false, maxlength: 32 })
  discordGuildId?: string;

  @ApiProperty({ example: 'oiujoiuoo8u', maxLength: 16 })
  @IsString()
  @Prop({ type: String, length: 10 })
  discordLinkNonce?: string;

  @ApiProperty({ example: true })
  @IsBoolean()
  @Prop({ type: Boolean, default: true })
  // In this step all communities should be public, but we may allow premium communities be private
  isPublic: boolean;

  @ApiProperty({
    enum: DiscordLinkState,
    example: 'NOT_SET | PENDING | ACTIVE | DEACTIVE',
  })
  @IsEnum(DiscordLinkState)
  @Prop({
    type: String,
    enum: Object.values(DiscordLinkState),
  })
  discordLinkState?: string;
}

export const CommunitySchema =
  SchemaFactory.createForClass(Community).plugin(mongoosePagination);

export const CommunityModel = model<Community, Pagination<Community>>(
  'Community',
  CommunitySchema,
);
