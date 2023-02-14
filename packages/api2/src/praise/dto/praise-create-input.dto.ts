import { UserAccount } from '@/useraccounts/schemas/useraccounts.schema';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsString } from 'class-validator';

export class PraiseCreateInputDto {
  @ApiProperty({ required: true })
  @IsString()
  reason: string;

  @ApiProperty({ required: true })
  @IsString()
  reasonRealized: string;

  @ApiProperty({ required: true })
  @IsString()
  receiverIds: string[];

  @ApiProperty({ required: true })
  @Type(() => UserAccount)
  giver: UserAccount;

  @ApiProperty({ required: true })
  @IsString()
  sourceId: string;

  @ApiProperty({ required: true })
  @IsString()
  sourceName: string;
}
