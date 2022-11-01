import { PartialType } from '@nestjs/mapped-types';
import { User } from '../schemas/users.schema';

export class UpdateUserDto extends PartialType(User) {}
