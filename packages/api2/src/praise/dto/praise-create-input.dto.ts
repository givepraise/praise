import { UserAccount } from '@/useraccounts/schemas/useraccounts.schema';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsString } from 'class-validator';

export class PraiseCreateInputDto {
  @ApiProperty({ required: true })
  @IsString()
  reason: string;

  @ApiProperty({ required: true })
  @IsString()
  reasonRaw: string;

  @ApiProperty({ required: true })
  @IsNotEmpty()
  receiverIds: string[];

  @ApiProperty({ required: true })
  @IsNotEmpty()
  giver: UserAccount;

  @ApiProperty({ required: true })
  @IsString()
  sourceId: string;

  @ApiProperty({ required: true })
  @IsString()
  sourceName: string;
}
