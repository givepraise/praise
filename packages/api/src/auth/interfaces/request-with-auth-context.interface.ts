import { Request } from '@nestjs/common';
import { AuthContext } from '../auth-context';

export interface RequestWithAuthContext extends Request {
  authContext: AuthContext;
}
