import { UserDto } from './user.dto';

export interface UserWithStatsDto extends UserDto {
  receivedTotalCount: number;
  receivedTotalScore: number;
  givenTotalCount: number;
  givenTotalScore: number;
}
