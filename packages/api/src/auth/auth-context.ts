import { Types } from 'mongoose';
import { AuthRole } from './enums/auth-role.enum';

/**
 * The AuthContext is used to store information about the authenticated user.
 * It is used by the AuthGuard and the PermissionsGuard. Authentication can
 * happen in three ways:
 * 1. Signed JWT, containing the user id, roles.
 * 2. Manually configured API key, defined in the environment variables.
 * 3. API key configured in the database.
 *
 * A valid AuthContext contains one of the following: userId, apiKey or apiKeyId.
 */
export class AuthContext {
  userId?: Types.ObjectId; // The user id of the authenticated user.
  identityEthAddress?: string;
  apiKey?: string; // The API key as it is configured in the environment variables.
  apiKeyId?: Types.ObjectId; // The API id for keys configured in the database.
  roles: AuthRole[];
}
