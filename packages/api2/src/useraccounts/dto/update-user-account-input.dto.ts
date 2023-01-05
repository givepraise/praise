import { PartialType } from '@nestjs/swagger';
import { UserAccount } from '../schemas/useraccounts.schema';

export class UpdateUserAccountInputDto extends PartialType(UserAccount) {}
