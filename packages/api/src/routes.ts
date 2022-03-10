import { activateRouter } from '@activate/routes';
import { authMiddleware } from '@auth/middleware';
import { authRouter } from '@auth/routes';
import { Router } from '@awaitjs/express';
import { NOT_FOUND } from '@error/constants';
import { adminPeriodRouter, periodRouter } from '@period/routes';
import { praiseRouter } from '@praise/routes';
import { settingsAdminRouter, settingsRouter } from '@settings/routes';
import { adminUserRouter, userRouter } from '@user/routes';
import { UserRole } from '@user/types';
import { userAccountRouter } from '@useraccount/routes';
const baseRouter = Router();

/* Open routes */

baseRouter.use('/auth', authRouter);
baseRouter.use('/activate', activateRouter);

/* USER authentication */

baseRouter.useAsync('/settings', authMiddleware(UserRole.USER));
baseRouter.use('/settings', settingsRouter);

baseRouter.useAsync('/users', authMiddleware(UserRole.USER));
baseRouter.use('/users', userRouter);

baseRouter.useAsync('/periods', authMiddleware(UserRole.USER));
baseRouter.use('/periods', periodRouter);

baseRouter.useAsync('/praise', authMiddleware(UserRole.USER));
baseRouter.use('/praise', praiseRouter);

baseRouter.useAsync('/useraccount', authMiddleware(UserRole.USER));
baseRouter.use('/useraccount', userAccountRouter);

/* ADMIN authentication */

baseRouter.useAsync('/admin/users', authMiddleware(UserRole.ADMIN));
baseRouter.use('/admin/users', adminUserRouter);

baseRouter.useAsync('/admin/periods', authMiddleware(UserRole.ADMIN));
baseRouter.use('/admin/periods', adminPeriodRouter);

baseRouter.useAsync('/admin/settings', authMiddleware(UserRole.ADMIN));
baseRouter.use('/admin/settings', settingsAdminRouter);

/* NOT FOUND */

baseRouter.all('*', (req, res) => {
  res.status(404).json({
    status: NOT_FOUND,
    message: `Can't find ${req.originalUrl} on this server!`,
  });
});

export { baseRouter };
