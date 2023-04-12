import { ApiResponseProperty, OmitType } from '@nestjs/swagger';
import { UserAccount } from '../schemas/useraccounts.schema';

export class CreateUserAccountResponseDto extends OmitType(UserAccount, [
  'activateToken',
]) {
  @ApiResponseProperty({
    example: 'jkhvuygi643jh35g53',
    type: 'string',
  })
  activateToken?: string;
}
