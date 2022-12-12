import { Request } from '@nestjs/common';
import { User } from '@/users/schemas/users.schema';

export interface RequestWithUser extends Request {
  user: User;
}
