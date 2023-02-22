import { PartialType } from '@nestjs/mapped-types';
import { UserAccount } from '../schemas/useraccounts.schema';

export class UpdateUserAccountInputDto extends PartialType(UserAccount) {}