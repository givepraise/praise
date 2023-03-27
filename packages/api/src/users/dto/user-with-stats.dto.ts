import { IntersectionType } from '@nestjs/mapped-types';
import { User } from '../schemas/users.schema';
import { UserStatsDto } from './user-stats.dto';

export class UserWithStatsDto extends IntersectionType(User, UserStatsDto) {}
