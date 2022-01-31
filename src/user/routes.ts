import { routeTypeMiddleware } from '@middleware/routeType';
import { RouteType } from '@shared/constants';
import { Router } from 'express';
import { addRole, all, removeRole, search, single } from './controllers';

// User routes
const userRouter = Router();
userRouter.get('/all', all);
userRouter.get('/:id', single);

// User admin only routes
const adminUserRouter = Router();
adminUserRouter.get('/all', routeTypeMiddleware(RouteType.admin), all);
adminUserRouter.get('/search', routeTypeMiddleware(RouteType.admin), search);
adminUserRouter.get('/:id', routeTypeMiddleware(RouteType.admin), single);
adminUserRouter.patch(
  '/:id/addRole',
  routeTypeMiddleware(RouteType.admin),
  addRole
);
adminUserRouter.patch(
  '/:id/removeRole',
  routeTypeMiddleware(RouteType.admin),
  removeRole
);

export { userRouter, adminUserRouter };
