import { ApiProperty, PartialType, PickType } from '@nestjs/swagger';
import { UserAccount } from '../schemas/useraccounts.schema';
import { IsOptional } from 'class-validator';
import { IsObjectId } from '@/shared/validators.shared';
import { Transform } from 'class-transformer';
import { Types } from 'mongoose';

export class UpdateUserAccountInputDto extends PartialType(
  PickType(UserAccount, [
    'accountId',
    'avatarId',
    'name',
    'platform',
    'activateToken',
  ] as const),
) {
  @ApiProperty({
    required: false,
    type: 'string',
    example: '63b428f7d9ca4f6ff5370d05',
  })
  @IsOptional()
  @IsObjectId()
  @Transform(({ value }) =>
    Types.ObjectId.isValid(value) ? new Types.ObjectId(value) : value,
  )
  user?: Types.ObjectId;
}
