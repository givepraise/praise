import { Router } from 'express';
import authRouter from './auth';
import periodRouter from './periods';
import praiseRouter from './praises';
import userRouter from './users';

// Export the base-router
const baseRouter = Router();
baseRouter.use('/users', userRouter);
baseRouter.use('/auth', authRouter);
baseRouter.use('/periods', periodRouter);
baseRouter.use('/praises', praiseRouter);

export default baseRouter;
