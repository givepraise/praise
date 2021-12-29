import * as periodController from '@controllers/periods';
import { Router } from 'express';

// Period-routes
const periodRouter = Router();
periodRouter.get('/all', periodController.all);
periodRouter.post('/create', periodController.create);
periodRouter.get('/:periodId', periodController.single);
periodRouter.patch('/:periodId/update', periodController.update);
periodRouter.patch('/:periodId/close', periodController.close);
periodRouter.patch(
  '/:periodId/verifyQuantifierPoolSize',
  periodController.verifyQuantifierPoolSize
);
export = periodRouter;
