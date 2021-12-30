import { UserRole } from '@entities/User';
import { authMiddleware } from '@middleware/auth';
import { Router } from 'express';
import controller from '../controllers/users';

// User-routes
const userRouter = Router();
userRouter.get('/all', authMiddleware(UserRole.user), controller.all);
userRouter.get('/:id', controller.single);

export = userRouter;
