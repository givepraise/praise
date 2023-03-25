import { ExposeId } from '../../shared/decorators/expose-id.decorator';
import { UserAccount } from '../../useraccounts/schemas/useraccounts.schema';
import { ApiResponseProperty, PickType } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { Types } from 'mongoose';

export class PeriodDetailsGiverReceiverDto extends PickType(UserAccount, [
  '_id',
  'accountId',
  'name',
  'avatarId',
  'createdAt',
  'updatedAt',
  'platform',
]) {
  @ApiResponseProperty({ example: '621f802b813dbdba9eeaf7d7', type: 'string' })
  @ExposeId()
  user: Types.ObjectId;

  @ApiResponseProperty({ type: 'number', example: '5' })
  praiseCount: number;

  @ApiResponseProperty({ type: 'number', example: 144 })
  @Transform(({ value }) => Math.round(value * 100) / 100)
  score: number;

  // @ApiResponseProperty({ type: [Quantification] })
  // quantifications?: Array<Quantification>;
}
