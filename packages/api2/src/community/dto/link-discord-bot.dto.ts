import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class LinkDiscordBotDto {
  @ApiProperty({
    example:
      '0xdb4bb91357b23083ec2a36dc1fe23e59b71434fc020542da7e983df206ed06611e275eb30e239508f9758c0608dca6cef5619c41b50a48f22bdb36a8dabc2d201c',
  })
  @IsString()
  @IsNotEmpty()
  signedMessage: string;
}
