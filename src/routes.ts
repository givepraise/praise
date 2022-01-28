import { UserRole } from '@entities/User';
import { NOT_FOUND } from '@shared/constants';
import { Router } from 'express';
import { authMiddleware } from 'src/auth/middleware';
import activateRouter from './activate';
import adminPeriodRouter from './admin/periods';
import adminPraiseRouter from './admin/praise';
import adminSettingsRouter from './admin/settings';
import adminUserRouter from './admin/users';
import { authRouter } from './auth/routes';
import periodRouter from './periods';
import praiseRouter from './praise';
import settingsRouter from './settings';
import userAccountRouter from './useraccounts';
import userRouter from './users';

// Export the base-router
const baseRouter = Router();

baseRouter.use('/auth', authRouter);

baseRouter.use('/activate', activateRouter);

baseRouter.use('/settings', authMiddleware(UserRole.USER), settingsRouter);
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
  authMiddleware(UserRole.ADMIN),
  adminSettingsRouter
);

baseRouter.all('*', (req, res) => {
  res.status(404).json({
    status: NOT_FOUND,
    message: `Can't find ${req.originalUrl} on this server!`,
  });
});

export default baseRouter;
