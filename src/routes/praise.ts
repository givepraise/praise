import { UserRole } from '@entities/User';
import { authMiddleware } from '@middleware/auth';
import { Router } from 'express';
import controller from '../controllers/praise';

// Praise-routes
const praiseRouter = Router();
praiseRouter.get('/all', authMiddleware(UserRole.user), controller.all);
praiseRouter.get('/:id', authMiddleware(UserRole.user), controller.single);

export = praiseRouter;
