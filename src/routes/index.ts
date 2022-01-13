import { UserRole } from '@entities/User';
import { authMiddleware } from '@middleware/auth';
import { Router } from 'express';
import adminPeriodRouter from './admin/periods';
import adminUserRouter from './admin/users';
import adminPraiseRouter from './admin/praise';
import authRouter from './auth';
import periodRouter from './periods';
import praiseRouter from './praise';
import userRouter from './users';
import userAccountRouter from './useraccounts';
import settingsRouter from './admin/settings';
import { NOT_FOUND } from '@shared/constants';

// Export the base-router
const baseRouter = Router();

baseRouter.use('/auth', authRouter);

baseRouter.use('/users', authMiddleware(UserRole.USER), userRouter);
baseRouter.use('/periods', authMiddleware(UserRole.USER), periodRouter);
baseRouter.use('/praise', authMiddleware(UserRole.USER), praiseRouter);
baseRouter.use(
  '/useraccount',
  authMiddleware(UserRole.USER),
  userAccountRouter
);

baseRouter.use('/admin/users', authMiddleware(UserRole.ADMIN), adminUserRouter);
baseRouter.use(
  '/admin/periods',
  authMiddleware(UserRole.ADMIN),
  adminPeriodRouter
);
baseRouter.use(
  '/admin/praise',
  authMiddleware(UserRole.ADMIN),
  adminPraiseRouter
);

baseRouter.use(
  '/admin/settings',
  authMiddleware(UserRole.USER),
  settingsRouter
);

baseRouter.all('*', (req, res, next) => {
  res.status(404).json({
    status: NOT_FOUND,
    message: `Can't find ${req.originalUrl} on this server!`,
  });
});

export default baseRouter;
