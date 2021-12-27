import { Router } from 'express';
import userRouter from './users';
import periodRouter from './periods';
import praiseRouter from './praises';
import adminUserRouter from './admin/users';

// Export the base-router
const baseRouter = Router();
baseRouter.use('/users', userRouter);
baseRouter.use('/admin/users', adminUserRouter);

baseRouter.use('/periods', periodRouter);
baseRouter.use('/praises', praiseRouter);
export default baseRouter;
