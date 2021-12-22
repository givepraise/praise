import { Router } from 'express';
import controller from '../controllers/praises';

// Praise-routes
const praiseRouter = Router();
praiseRouter.get('/', controller.getPraises);

export = praiseRouter;
