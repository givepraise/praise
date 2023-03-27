import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class ActivateInputDto {
  @ApiProperty({
    example: '0xAAB27b150451726EC7738aa1d0A94505c8729bd1',
    type: 'string',
  })
  @IsString()
  @IsNotEmpty()
  identityEthAddress: string;

  @ApiProperty({
    example: 'darth#3455',
    type: 'string',
  })
  @IsString()
  @IsNotEmpty()
  accountId: string;

  @ApiProperty({
    example:
      '0xdb4bb91357b23083ec2a36dc1fe23e59b71434fc020542da7e983df206ed06611e275eb30e239508f9758c0608dca6cef5619c41b50a48f22bdb36a8dabc2d201c',
    type: 'string',
  })
  @IsString()
  @IsNotEmpty()
  signature: string;
}
