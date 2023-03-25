import { PickType } from '@nestjs/swagger';
import { IsObjectId } from '@/shared/validators/is-object-id.validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsOptional } from 'class-validator';
import { Types } from 'mongoose';
import { UserAccount } from '../schemas/useraccounts.schema';

export class CreateUserAccountInputDto extends PickType(UserAccount, [
  'accountId',
  'name',
  'avatarId',
  'platform',
] as const) {
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
