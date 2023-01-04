import { PartialType } from '@nestjs/mapped-types';
import { User } from '../schemas/users.schema';

export class UpdateUserInputDto extends PartialType(User) {}
