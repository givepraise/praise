import { getPraise } from '@controllers/praise';
import { UserRole } from '@entities/User';
import { authMiddleware } from '@middleware/auth';
import { Router } from 'express';

// Praise-routes
const praiseRouter = Router();
praiseRouter.get('/all', authMiddleware(UserRole.user), getPraise);

export = praiseRouter;
