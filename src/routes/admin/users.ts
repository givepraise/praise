import controller from '@controllers/users';
import { UserRole } from '@entities/User';
import { authMiddleware } from '@middleware/auth';
import { routeTypeMiddleware } from '@middleware/routeType';
import { RouteType } from '@shared/constants';
import { Router } from 'express';

// User-routes
const userRouter = Router();
userRouter.get(
  '/all',
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
