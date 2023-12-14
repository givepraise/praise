import { UserAccount } from '../../useraccounts/schemas/useraccounts.schema';
import { ApiProperty, PickType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsOptional, ValidateNested } from 'class-validator';
import { Praise } from '../schemas/praise.schema';

export class PraiseCreateInputDto extends PickType(Praise, [
  'reasonRaw',
  'reason',
  'sourceId',
  'sourceName',
]) {
  @ApiProperty({ required: true, type: ['string'] })
  @IsNotEmpty()
  receiverIds: string[];

  @ApiProperty({
    type: UserAccount,
  })
  @ValidateNested()
  @Type(() => UserAccount)
  @IsNotEmpty()
  giver: UserAccount;

  @ApiProperty({ required: false })
  @IsOptional()
  score: number;
}
