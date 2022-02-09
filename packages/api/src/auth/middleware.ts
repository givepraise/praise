/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { ForbiddenError, UnauthorizedError } from '@shared/errors';
import { UserModel } from '@user/entities';
import { UserRole } from '@user/types';
import { NextFunction, Request, Response } from 'express';
import { JwtService } from './JwtService';

const jwtService = new JwtService();

export const authMiddleware = (role: UserRole) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Get authorization header
    const AuthHeader = req.headers['authorization'];
    if (typeof AuthHeader === 'undefined')
      throw new UnauthorizedError('JWT not present in header.');

    // Check authorization header format
    const bearer = AuthHeader.split(' ');
    if (!Array.isArray(bearer) || bearer.length !== 2)
      throw new UnauthorizedError('Invalid authorization bearer format.');

    // Separate the accessToken
    const accessToken = bearer[1];

    // Find User with matching token
    const user = await UserModel.findOne({
      accessToken,
    });

    // No user or wrong permissions = Forbidden
    if (!user || !user.roles.includes(role))
      throw new ForbiddenError('User is not authorized to access resource.');

    // Save auth role and current user for usage in controllers
    res.locals.authRole = role;
    res.locals.currentUser = user;

    next();
  };
};
