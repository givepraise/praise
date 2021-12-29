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
  [authMiddleware(UserRole.admin), routeTypeMiddleware(RouteType.admin)],
  controller.all
);

userRouter.get(
  '/search',
  [authMiddleware(UserRole.admin), routeTypeMiddleware(RouteType.admin)],
  controller.search
);

userRouter.get(
  '/:id',
  [authMiddleware(UserRole.admin), routeTypeMiddleware(RouteType.admin)],
  controller.single
);

userRouter.post(
  '/:id/addRole',
  [authMiddleware(UserRole.user), routeTypeMiddleware(RouteType.admin)],
  controller.addRole
);

userRouter.post(
  '/:id/removeRole',
  [authMiddleware(UserRole.admin), routeTypeMiddleware(RouteType.admin)],
  controller.removeRole
);

export = userRouter;
