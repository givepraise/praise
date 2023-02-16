import { UserAccount } from '@/useraccounts/schemas/useraccounts.schema';
import { ApiProperty, PickType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { isNotEmpty, IsNotEmpty, ValidateNested } from 'class-validator';
import { Praise } from '../schemas/praise.schema';

export class PraiseCreateInputDto extends PickType(Praise, [
  'reasonRaw',
  'reason',
  'sourceId',
  'sourceName',
  'forwarder',
]) {
  @ApiProperty({ required: true })
  @IsNotEmpty()
  receiverIds: string[];

  @ApiProperty({
    type: UserAccount,
  })
  @ValidateNested()
  @Type(() => UserAccount)
  @IsNotEmpty()
  giver: UserAccount;
}
