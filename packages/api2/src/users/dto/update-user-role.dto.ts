import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { AuthRole } from '@/auth/enums/auth-role.enum';

export class UpdateUserRoleDto {
  @ApiProperty({ enum: AuthRole })
  @IsEnum(AuthRole)
  role: AuthRole;
}
