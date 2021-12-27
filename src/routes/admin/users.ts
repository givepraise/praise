import { Router } from 'express';
import controller from '@controllers/users';
import { RouteType } from '@shared/constants';
import { routeTypeMiddleware } from '@middleware/routeType';
import { UserRole } from '@entities/User';
import { authMiddleware } from '@middleware/auth';

// User-routes
const userRouter = Router();
userRouter.get(
  '/',
  [authMiddleware(UserRole.user), routeTypeMiddleware(RouteType.admin)],
  controller.getUsers
);
userRouter.get(
  '/:id',
  [authMiddleware(UserRole.user), routeTypeMiddleware(RouteType.admin)],
  controller.getUser
);

export = userRouter;
