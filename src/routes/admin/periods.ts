import * as periodController from '@controllers/periods';
import { Router } from 'express';

// Period-routes
const periodRouter = Router();
periodRouter.post('/create', periodController.create);
periodRouter.patch('/:periodId/update', periodController.update);
periodRouter.patch('/:periodId/close', periodController.assignQuantifiers);
periodRouter.patch(
  '/:periodId/verifyQuantifierPoolSize',
  periodController.verifyQuantifierPoolSize
);
export = periodRouter;
