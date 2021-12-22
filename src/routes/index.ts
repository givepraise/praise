import { Router } from 'express';
import userRouter from './users';
import periodRouter from './periods';
import praiseRouter from './praises';

// Export the base-router
const baseRouter = Router();
baseRouter.use('/users', userRouter);
baseRouter.use('/periods', periodRouter);
baseRouter.use('/praises', praiseRouter);
export default baseRouter;
