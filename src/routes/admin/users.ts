import { routeTypeMiddleware } from '@middleware/routeType';
import { RouteType } from '@shared/constants';
import { Router } from 'express';
import controller from 'src/user/controllers';

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
