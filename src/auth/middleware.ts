/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import {
  ForbiddenError,
  NotFoundError,
  UnauthorizedError,
} from '@shared/errors';
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

    // Decode JWT and check permissions
    const accessToken = bearer[1];
    const clientData = await jwtService.decodeJwt(accessToken);

    if (!clientData.roles.includes(role))
      throw new ForbiddenError('User is not authorized to access resource.');

    const user = await UserModel.findOne({
      ethereumAddress: clientData.ethereumAddress,
    });
    if (!user) throw new NotFoundError('User');

    // Save current user for usage in endpoints
    res.locals.currentUser = user;

    next();
  };
};
