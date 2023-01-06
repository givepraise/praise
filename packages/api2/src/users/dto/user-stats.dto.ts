import { ApiResponseProperty } from '@nestjs/swagger';

export class UserStatsDto {
  @ApiResponseProperty()
  receivedTotalScore?: number;

  @ApiResponseProperty()
  receivedTotalCount?: number;

  @ApiResponseProperty()
  givenTotalScore?: number;

  @ApiResponseProperty()
  givenTotalCount?: number;
}
