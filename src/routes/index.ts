import { Router } from 'express';
import authRouter from './auth';
import periodRouter from './periods';
import adminUserRouter from './admin/users';
import praiseRouter from './praise';
import userRouter from './users';

// Export the base-router
const baseRouter = Router();
baseRouter.use('/users', userRouter);
baseRouter.use('/auth', authRouter);
baseRouter.use('/periods', periodRouter);
baseRouter.use('/praise', praiseRouter);

baseRouter.use('/admin/users', adminUserRouter);

export default baseRouter;
