import { activateRouter } from '@activate/routes';
import { adminPeriodRouter, periodRouter } from '@period/routes';
import { praiseRouter } from '@praise/routes';
import { adminSettingsRouter, settingsRouter } from '@settings/routes';
import { NOT_FOUND } from '@shared/constants';
import { adminUserRouter, userRouter } from '@user/routes';
import { UserRole } from '@user/types';
import { userAccountRouter } from '@useraccount/routes';
import { Router } from 'express';
import { authMiddleware } from 'src/auth/middleware';
import { authRouter } from './auth/routes';

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

export { baseRouter };
