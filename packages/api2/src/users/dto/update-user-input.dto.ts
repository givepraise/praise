import { PartialType } from '@nestjs/swagger';
import { User } from '../schemas/users.schema';

export class UpdateUserInputDto extends PartialType(User) {}
