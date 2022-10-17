/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { NextFunction, Request, Response } from 'express';
import { ForbiddenError, UnauthorizedError } from '@/error/errors';
import { UserModel } from '@/user/entities';
import { UserRole } from '@/user/types';
import { ApiKeyAccess } from 'src/api-key/types';
import { ApiKeyModel } from 'src/api-key/entities';
import { extractAccessTokenFromRequest } from './utils';
import { JwtService } from './JwtService';

/**
 * express middleware to authenticate user,
 *  - makes authRole and currentUser available to all controllers
 *  - makes access and apikey available to all controllers
 *
 * @param  {UserRole} role
 * @param  {ApiKeyAccess} access
 */
export const authMiddleware = (role: UserRole, access: ApiKeyAccess) => {
  /**
   * @param  {Request} req
   * @param  {Response} res
   * @param  {NextFunction} next
   */
  return async (req: Request, res: Response, next: NextFunction) => {
    // Get authorization header
    const accessToken = extractAccessTokenFromRequest(req);

    let decoded;
    let user;
    let apiKey;

    // Access token invalid or expired = Forbidden
    const jwtService = new JwtService();
    try {
      decoded = jwtService.verifyOrFail(accessToken);
    } catch (err) {
      throw new UnauthorizedError('User is not authorized to access resource.');
    }

    // Check token type
    if (decoded.type === 'api-key') {
      if (req.method.toLowerCase() !== 'get')
        throw new UnauthorizedError(
          'ApiKey is not authorized to access resource.'
        );
      apiKey = await ApiKeyModel.findOne({ apiKey });
    }
    if (decoded.type === 'access-token') {
      user = await UserModel.findOne({ accessToken });
    }

    // No user or apiKey = Forbidden
    if (
      (decoded.type === 'access-token' && !user) ||
      (decoded.type === 'api-key' && !apiKey)
    ) {
      throw new UnauthorizedError('User is not authorized to access resource.');
    }

    // Wrong permissions = Forbidden
    if (
      (decoded.type === 'access-token' && !user?.roles.includes(role)) ||
      (decoded.type === 'api-key' && !apiKey?.access.includes(access))
    ) {
      throw new ForbiddenError('User is not authorized to access resource.');
    }

    // Save auth role and current user for usage in controllers
    res.locals.currentUser = user;
    // Save API key and api key access for usage in controllers
    res.locals.apikey = apiKey;

    next();
  };
};
