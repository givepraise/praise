import { IsNumber, IsString } from 'class-validator';
import { Prop } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';

export class TwitterBot {
  @ApiProperty({ example: 'e.g. 1655693432172494852', required: true })
  @IsNumber()
  @Prop({ required: true })
  twitterBotId: number;

  @ApiProperty({ example: 'e.g. givethpraise', required: true })
  @IsString()
  @Prop({ required: true })
  twitterBotUsername: string;

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
