import { Router } from 'express';
import controller from '../controllers/users';
import { UserRole } from '@entities/User';
import { authMiddleware } from '@middleware/auth';

// User-routes
const userRouter = Router();
userRouter.get('/', authMiddleware(UserRole.user), controller.getUsers);
userRouter.get('/:id', controller.getUser);

export = userRouter;
