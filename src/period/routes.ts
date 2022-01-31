import { routeTypeMiddleware } from '@middleware/routeType';
import * as periodController from '@period/controllers';
import { RouteType } from '@shared/constants';
import { Router } from 'express';

// Period-routes
const periodRouter = Router();

periodRouter.get('/all', periodController.all);
periodRouter.get('/:periodId', periodController.single);
periodRouter.get('/:periodId/praise', periodController.praise);

// ADMIN Period-routes
const adminPeriodRouter = Router();
adminPeriodRouter.post(
  '/create',
  routeTypeMiddleware(RouteType.admin),
  periodController.create
);
adminPeriodRouter.patch(
  '/:periodId/update',
  routeTypeMiddleware(RouteType.admin),
  periodController.update
);
adminPeriodRouter.patch(
  '/:periodId/close',
  routeTypeMiddleware(RouteType.admin),
  periodController.close
);
adminPeriodRouter.get(
  '/:periodId/verifyQuantifierPoolSize',
  routeTypeMiddleware(RouteType.admin),
  periodController.verifyQuantifierPoolSize
);
adminPeriodRouter.patch(
  '/:periodId/assignQuantifiers',
  routeTypeMiddleware(RouteType.admin),
  periodController.assignQuantifiers
);

export { periodRouter, adminPeriodRouter };
