import { UserRole } from '@entities/User';
import { authMiddleware } from '@middleware/auth';
import { Router } from 'express';
import adminPeriodRouter from './admin/periods';
import adminUserRouter from './admin/users';
import authRouter from './auth';
import periodRouter from './periods';
import praiseRouter from './praise';
import userRouter from './users';
import { NOT_FOUND } from '@shared/constants';

// Export the base-router
const baseRouter = Router();

baseRouter.use('/auth', authRouter);

baseRouter.use('/users', authMiddleware(UserRole.USER), userRouter);
baseRouter.use('/periods', authMiddleware(UserRole.USER), periodRouter);
baseRouter.use('/praise', authMiddleware(UserRole.USER), praiseRouter);

baseRouter.use('/admin/users', authMiddleware(UserRole.ADMIN), adminUserRouter);
baseRouter.use(
  '/admin/periods',
  authMiddleware(UserRole.ADMIN),
  adminPeriodRouter
);

baseRouter.all('*', (req, res, next) => {
  res.status(404).json({
    status: NOT_FOUND,
    message: `Can't find ${req.originalUrl} on this server!`,
  });
});

export default baseRouter;
