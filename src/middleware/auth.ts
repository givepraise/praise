import UserModel, { UserRole } from '@entities/User';
import {
  ForbiddenError,
  NotFoundError,
  UnauthorizedError,
} from '@shared/errors';
import { JwtService } from '@shared/JwtService';
import { NextFunction, Request, Response } from 'express';

const jwtService = new JwtService();

// Middleware to verify if user is an admin
export const authMiddleware = (role: UserRole) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Get authorization header
    const AuthHeader = req.headers['authorization'];
    if (typeof AuthHeader === 'undefined')
      throw new UnauthorizedError('JWT not present in header.');

    // Check authorization header format
    const bearer = AuthHeader.split(' ');
    if (!Array.isArray(bearer) || bearer.length != 2)
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
    req.body.currentUser = user;

    res.locals.roles = clientData.roles;
    res.locals.ethereumAddress = clientData.ethereumAddress;

    next();
  };
};
