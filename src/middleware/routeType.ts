import { RouteType } from '@shared/constants';
import { NextFunction, Request, Response } from 'express';

export const routeTypeMiddleware = (type: RouteType) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    req.body.routeType = type;
    next();
  };
};
