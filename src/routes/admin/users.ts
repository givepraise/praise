import controller from '@controllers/users';
import { routeTypeMiddleware } from '@middleware/routeType';
import { RouteType } from '@shared/constants';
import { Router } from 'express';

// User-routes
const userRouter = Router();
userRouter.get('/all', routeTypeMiddleware(RouteType.admin), controller.all);

userRouter.get(
  '/search',
  routeTypeMiddleware(RouteType.admin),
  controller.search
);

userRouter.get('/:id', routeTypeMiddleware(RouteType.admin), controller.single);

userRouter.patch(
  '/:id/addRole',
  routeTypeMiddleware(RouteType.admin),
  controller.addRole
);

userRouter.patch(
  '/:id/removeRole',
  routeTypeMiddleware(RouteType.admin),
  controller.removeRole
);

export default userRouter;
