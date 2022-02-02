import { activateRouter } from '@activate/routes';
import { authRouter } from '@auth/routes';
import { adminPeriodRouter, periodRouter } from '@period/routes';
import { praiseRouter } from '@praise/routes';
import { settingsAdminRouter, settingsRouter } from '@settings/routes';
import { NOT_FOUND } from '@shared/constants';
import { adminUserRouter, userRouter } from '@user/routes';
import { UserRole } from '@user/types';
import { userAccountRouter } from '@useraccount/routes';
import { Router } from 'express';
import { authMiddleware } from 'src/auth/middleware';
const baseRouter = Router();

/* Open routes */

baseRouter.use('/auth', authRouter);
baseRouter.use('/activate', activateRouter);

/* USER authentication */

baseRouter.use('/settings', authMiddleware(UserRole.USER), settingsRouter);
baseRouter.use('/users', authMiddleware(UserRole.USER), userRouter);
baseRouter.use('/periods', authMiddleware(UserRole.USER), periodRouter);
baseRouter.use('/praise', authMiddleware(UserRole.USER), praiseRouter);
baseRouter.use(
  '/useraccount',
  authMiddleware(UserRole.USER),
  userAccountRouter
);

/* ADMIN authentication */

baseRouter.use('/admin/users', authMiddleware(UserRole.ADMIN), adminUserRouter);
baseRouter.use(
  '/admin/periods',
  authMiddleware(UserRole.ADMIN),
  adminPeriodRouter
);
baseRouter.use(
  '/admin/settings',
  authMiddleware(UserRole.ADMIN),
  settingsAdminRouter
);

baseRouter.all('*', (req, res) => {
  res.status(404).json({
    status: NOT_FOUND,
    message: `Can't find ${req.originalUrl} on this server!`,
  });
});

export { baseRouter };
