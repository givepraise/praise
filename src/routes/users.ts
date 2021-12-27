import { Router } from 'express';
import controller from '../controllers/users';

// User-routes
const userRouter = Router();
userRouter.get('/', controller.getUsers);
userRouter.get('/:id', controller.getUser);

export = userRouter;
