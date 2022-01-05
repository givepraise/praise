import { Router } from 'express';
import controller from '../controllers/praise';

// Praise-routes
const praiseRouter = Router();
praiseRouter.get('/all', controller.all);
praiseRouter.get('/:id', controller.single);
praiseRouter.patch('/:id/quantify', controller.quantify);

export = praiseRouter;
