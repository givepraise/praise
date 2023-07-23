import { ExposeId } from '../../shared/decorators/expose-id.decorator';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Document, Types } from 'mongoose';
import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { DiscordLinkState } from '../enums/discord-link-state';
import { IsEthAddress } from '../../shared/validators/is-eth-address.validator';
import { isValidCommunityName } from '../utils/is-valid-community-name';
import { isValidOwners } from '../utils/is-valid-owners';
import { isValidHostname } from '../utils/is-valid-hostname';
import mongoosePaginate from 'mongoose-paginate-v2';
import { TwitterBot, TwitterBotSchema } from './twitterBot.schema';

export type CommunityDocument = Community & Document;

@Schema({ timestamps: true })
export class Community {
  constructor(partial?: Partial<Community>) {
    if (partial) {
      Object.assign(this, partial);
    }
  }

  @ApiProperty({
    example: '621f802b813dbdba9eeaf7b4',
    type: 'string',
    required: true,
  })
  @IsString()
  @ExposeId()
  _id: Types.ObjectId;

  @ApiProperty({
    example: 'banklessdao.givepraise.xyz',
    required: true,
    maxLength: 255,
  })
  @IsString()
  @Prop({
    type: String,
    required: true,
    maxlength: 255,
    unique: true,
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
    maxlength: 30,
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
    maxLength: 255,
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
  // owners should contain creator, so it has at least one owner
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
  @Prop({
    type: String,
    required: false,
    maxlength: 255,
    unique: true,
    sparse: true,
  })
  discordGuildId?: string;

  @ApiProperty({ example: 'oiujoiuoo8u', maxLength: 255 })
  @IsString()
  @Prop({ type: String, length: 10, required: false })
  discordLinkNonce?: string;

  @ApiProperty({ example: true })
  @IsBoolean()
  @Prop({ type: Boolean, default: true, required: true })
  // In this step all communities should be public, but we may allow premium communities be private
  isPublic: boolean;

  @ApiProperty({
    enum: DiscordLinkState,
  })
  @IsEnum(DiscordLinkState)
  @Prop({
    type: String,
    enum: Object.values(DiscordLinkState),
    default: DiscordLinkState.NOT_SET,
    required: true,
  })
  discordLinkState: string;

  @ApiProperty({
    required: false,
    example:
      '{\n' +
      '    "bearerToken":"AAAAAAAAAAAAAAAAAAAAAMsDPC...",\n' +
      '    "consumerKey":"9NPsm8UF6qIu...",\n' +
      '    "consumerSecret":"ciwhh1lli5S...",\n' +
      '    "accessToken":"165569343217...",\n' +
      '    "tokenSecret":"jv2kTUl2NBYbj...",\n' +
      '    "twitterBotId":e.g. 1655693432172494852,\n' +
      '    "twitterBotUsername":"e.g. givethpraise"\n' +
      '    "twitterBotName":"e.g. Giveth Praise Bot"\n' +
      '  }',
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => TwitterBot)
  @Prop({ type: TwitterBotSchema, required: false })
  twitterBot?: TwitterBot;
}

export const CommunitySchema = SchemaFactory.createForClass(Community);

CommunitySchema.plugin(mongoosePaginate);
