import { UserRole } from '@entities/User';
import { FORBIDDEN, UNAUTHORIZED } from '@shared/constants';
import { JwtService } from '@shared/JwtService';
import { NextFunction, Request, Response } from 'express';

const jwtService = new JwtService();

// Middleware to verify if user is an admin
export const authMiddleware = (role: UserRole) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Get authorization header
    const AuthHeader = req.headers['authorization'];
    if (typeof AuthHeader === 'undefined')
      return res.status(UNAUTHORIZED).json({
        error: 'JWT not present in header.',
      });

    // Check authorization header format
    const bearer = AuthHeader.split(' ');
    if (!Array.isArray(bearer) || bearer.length != 2)
      return res.status(UNAUTHORIZED).json({
        error: 'Invalid authorization bearer format.',
      });

    // Decode JWT and check permissions
    const accessToken = bearer[1];
    const clientData = await jwtService.decodeJwt(accessToken);

    if (!clientData.roles.includes(role))
      return res.status(FORBIDDEN).json({
        error: 'User is not authorized to access resource.',
      });

    res.locals.roles = clientData.roles;
    res.locals.ethereumAddress = clientData.ethereumAddress;

    next();
  };
};
