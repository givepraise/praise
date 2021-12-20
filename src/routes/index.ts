import { Router } from 'express';
import authRouter from './auth';
import userRouter from './users';

// Export the base-router
const baseRouter = Router();
baseRouter.use('/users', userRouter);
baseRouter.use('/auth', authRouter);
export default baseRouter;
