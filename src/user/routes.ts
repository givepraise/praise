import { routeTypeMiddleware } from '@middleware/routeType';
import { RouteType } from '@shared/constants';
import { Router } from 'express';
import { addRole, all, removeRole, search, single } from './controllers';

// User routes
const userRouter = Router();
userRouter.get('/all', all);
userRouter.get('/:id', single);

// User admin only routes
const userAdminRouter = Router();
userAdminRouter.get('/all', routeTypeMiddleware(RouteType.admin), all);
userAdminRouter.get('/search', routeTypeMiddleware(RouteType.admin), search);
userAdminRouter.get('/:id', routeTypeMiddleware(RouteType.admin), single);
userAdminRouter.patch(
  '/:id/addRole',
  routeTypeMiddleware(RouteType.admin),
  addRole
);
userAdminRouter.patch(
  '/:id/removeRole',
  routeTypeMiddleware(RouteType.admin),
  removeRole
);

export { userRouter, userAdminRouter };
