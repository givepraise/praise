import { ApiResponseProperty } from '@nestjs/swagger';

export class UserStatsDto {
  @ApiResponseProperty({ type: 'number' })
  receivedTotalScore?: number;

  @ApiResponseProperty({ type: 'number' })
  receivedTotalCount?: number;

  @ApiResponseProperty({ type: 'number' })
  givenTotalScore?: number;

  @ApiResponseProperty({ type: 'number' })
  givenTotalCount?: number;
}
