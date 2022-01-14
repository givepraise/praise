import * as periodController from '@controllers/periods';
import { Router } from 'express';

// Period-routes
const periodRouter = Router();

periodRouter.get('/all', periodController.all);
periodRouter.get('/:periodId', periodController.single);
periodRouter.get('/:periodId/praise', periodController.praise);

export default periodRouter;
