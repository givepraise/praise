import { UserAccount } from '../../useraccounts/schemas/useraccounts.schema';
import { ApiProperty, PickType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsOptional, ValidateNested } from 'class-validator';
import { PraiseCreateInputDto } from './praise-create-input.dto';

export class PraiseForwardInputDto extends PickType(PraiseCreateInputDto, [
  'reasonRaw',
  'reason',
  'sourceId',
  'sourceName',
  'receiverIds',
  'giver',
]) {
  @ApiProperty({
    type: UserAccount,
  })
  @ValidateNested()
  @Type(() => UserAccount)
  @IsNotEmpty()
  forwarder: UserAccount;

  @ApiProperty({ required: false })
  @IsOptional()
  score: number;
}
