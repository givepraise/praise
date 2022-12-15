import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateDescriptionRequest {
  @ApiProperty({ example: 'Telegram API key', required: true })
  @IsNotEmpty()
  @IsString()
  description: string;
}
