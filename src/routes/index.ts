import { Router } from 'express';
import authRouter from './auth';
import periodRouter from './periods';
import adminUserRouter from './admin/users';
import praiseRouter from './praise';
import userRouter from './users';
import { NOT_FOUND } from '@shared/constants';

// Export the base-router
const baseRouter = Router();
baseRouter.use('/users', userRouter);
baseRouter.use('/auth', authRouter);
baseRouter.use('/periods', periodRouter);
baseRouter.use('/praise', praiseRouter);

baseRouter.use('/admin/users', adminUserRouter);

baseRouter.all('*', (req, res, next) => {
  res.status(404).json({
    status: NOT_FOUND,
    message: `Can't find ${req.originalUrl} on this server!`,
  });
});

export default baseRouter;
