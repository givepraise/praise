import { UnauthorizedError } from '@error/errors';
import { Request } from 'express';

export const extractAccessTokenFromRequest = (req: Request): string => {
  const AuthHeader = req.headers['authorization'];
  if (typeof AuthHeader === 'undefined')
    throw new UnauthorizedError('JWT not present in header.');

  // Check authorization header format
  const bearer = AuthHeader.split(' ');
  if (!Array.isArray(bearer) || bearer.length !== 2)
    throw new UnauthorizedError('Invalid authorization bearer format.');

  // Separate the accessToken
  const accessToken = bearer[1];

  return accessToken;
};
