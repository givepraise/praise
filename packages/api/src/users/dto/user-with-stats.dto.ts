import { ApiResponseProperty } from '@nestjs/swagger';
import { User } from '../schemas/users.schema';

export class UserWithStatsDto extends User {
  @ApiResponseProperty({ type: 'number' })
  receivedTotalScore?: number;

  @ApiResponseProperty({ type: 'number' })
  receivedTotalCount?: number;

  @ApiResponseProperty({ type: 'number' })
  givenTotalScore?: number;

  @ApiResponseProperty({ type: 'number' })
  givenTotalCount?: number;
}
