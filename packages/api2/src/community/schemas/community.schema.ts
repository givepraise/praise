import { ExposeId } from '@/shared/decorators/expose-id.decorator';
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
  Validate,
  ValidateNested,
} from 'class-validator';
import { DiscordLinkState } from '../enums/discord-link-state';
import { IsEthAddress } from '@/shared/validators.shared';
import { isValidUsername } from '@/users/utils/is-valid-username';
import { isValidCommunityName } from '../utils/isValidCommunityName';
import { isValidOwners } from '../utils/isValidOwners';

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

  // TODO: Add a validator to check if the hostname is valid
  @ApiProperty({
    example: 'banklessdao.givepraise.xyz',
    required: true,
    minLength: 10,
    maxLength: 64,
  })
  @IsString()
  @Prop({ type: String, required: true, minlength: 10, maxlength: 64 })
  hostname: string;

  // TODO: Add a validator to check if the name is valid
  // only alphanumeric characters, underscores, dots, and hyphens are allowed.
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
  //TODO: Validate that all addresses are valid ethereum addresses
  @Prop({
    type: [String],
    required: true,
    length: 42,
    validate: {
      validator: (owners: string[]) => Promise.resolve(isValidOwners(owners)),
      message:
        'Invalid username, only alphanumeric characters, underscores, dots, and hyphens are allowed.',
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
