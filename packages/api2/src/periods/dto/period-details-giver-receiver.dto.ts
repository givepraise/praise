import { UserAccount } from '@/useraccounts/schemas/useraccounts.schema';
import { ApiResponseProperty, PickType } from '@nestjs/swagger';

export class PeriodDetailsGiverReceiverDto extends PickType(UserAccount, [
  '_id',
  'accountId',
  'name',
  'avatarId',
  'createdAt',
  'updatedAt',
  'platform',
]) {
  @ApiResponseProperty({ type: 'number', example: '5' })
  praiseCount: number;

  @ApiResponseProperty({ type: 'number', example: 144 })
  score: number;

  // @ApiResponseProperty({ type: [Quantification] })
  // quantifications?: Array<Quantification>;
}
