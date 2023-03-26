import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { AuthRole } from '../../auth/enums/auth-role.enum';

export class UpdateUserRoleInputDto {
  @ApiProperty({ enum: AuthRole })
  @IsEnum(AuthRole)
  role: AuthRole;
}
