import { Router } from 'express';
import controller from '../controllers/periods';

// Period-routes
const periodRouter = Router();
periodRouter.get('/', controller.getPeriods);

export = periodRouter;
