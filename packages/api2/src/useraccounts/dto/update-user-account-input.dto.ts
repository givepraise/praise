import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { UserAccount } from '../schemas/useraccounts.schema';

export class UpdateUserAccountInputDto extends PartialType(UserAccount) {
  @ApiProperty({
    required: false,
    type: 'string',
    example: '63b428f7d9ca4f6ff5370d05',
  })
  @IsOptional()
  @IsString()
  activateToken?: string;
}
