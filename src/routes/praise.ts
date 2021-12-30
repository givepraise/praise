import { Router } from 'express';
import controller from '../controllers/praise';

// Praise-routes
const praiseRouter = Router();
praiseRouter.get('/all', controller.all);
praiseRouter.get('/:id', controller.single);

export = praiseRouter;
