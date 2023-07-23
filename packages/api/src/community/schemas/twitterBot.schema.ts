import { IsNumber, IsOptional, IsString } from 'class-validator';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { ExposeId } from '../../shared/decorators/expose-id.decorator';
import { Types } from 'mongoose';

@Schema()

export class TwitterBot {
  @ApiProperty({
    example: '621f802b813dbdba9eeaf7b4',
    type: 'string',
  })
  @IsOptional()
  @IsString()
  @ExposeId()
  _id: Types.ObjectId;

  @ApiProperty({ example: 'e.g. "1655693432172494852"', required: true })
  @IsString()
  @Prop({ required: true })
  twitterBotId: string;

  @ApiProperty({ example: 'e.g. givethpraise', required: true })
  @IsString()
  @Prop({ required: true })
  twitterBotUsername: string;

  @ApiProperty({ example: 'e.g. Giveth Praise Bot', required: true })
  @IsString()
  @Prop({ required: true })
  twitterBotName: string;

  @ApiProperty({ example: 'AAAAAAAAAAAAAAAAAAAAAMsTng...', required: true })
  @IsString()
  @Prop({ required: true })
  bearerToken: string;

  @ApiProperty({ example: '9NPsm8UF6q...', required: true })
  @IsString()
  @Prop({ required: true })
  consumerKey: string;

  @ApiProperty({ example: '9NPsm8UF6q...', required: true })
  @IsString()
  @Prop({ required: true })
  consumerSecret: string;

  @ApiProperty({ example: '9NPsm8UF6q...', required: true })
  @IsString()
  @Prop({ required: true })
  accessToken: string;

  @ApiProperty({ example: '9NPsm8UF6q...', required: true })
  @IsString()
  @Prop({ required: true })
  tokenSecret: string;
}

export const TwitterBotSchema = SchemaFactory.createForClass(TwitterBot);
