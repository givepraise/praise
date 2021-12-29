import controller from '../controllers/praise';
import { UserRole } from '@entities/User';
import { authMiddleware } from '@middleware/auth';
import { Router } from 'express';

// Praise-routes
const praiseRouter = Router();
praiseRouter.get('/', authMiddleware(UserRole.user), controller.all);
praiseRouter.get('/:id', authMiddleware(UserRole.user), controller.single);

export = praiseRouter;
