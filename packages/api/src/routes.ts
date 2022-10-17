import { Router } from '@awaitjs/express';
import { activateRouter } from '@/activate/routes';
import { authMiddleware } from '@/auth/middleware';
import { authRouter } from '@/auth/routes';
import { NOT_FOUND } from '@/error/constants';
import { adminPeriodRouter, periodRouter } from '@/period/routes';
import { praiseRouter } from '@/praise/routes';
import { settingsAdminRouter, settingsRouter } from '@/settings/routes';
import { adminUserRouter, userRouter } from '@/user/routes';
import { UserRole } from '@/user/types';
import {
  periodsettingsRouter,
  adminPeriodsettingsRouter,
} from '@/periodsettings/routes';
import { eventLogRouter } from '@/eventlog/routes';
import { ApiKeyAccess } from './api-key/types';

const baseRouter = Router();

/* Open routes */

baseRouter.use('/auth', authRouter);
baseRouter.use('/activate', activateRouter);

/* USER authentication */

baseRouter.useAsync(
  '/settings',
  authMiddleware(UserRole.USER, ApiKeyAccess.LIMITED)
);
baseRouter.use('/settings', settingsRouter);

baseRouter.useAsync(
  '/users',
  authMiddleware(UserRole.USER, ApiKeyAccess.LIMITED)
);
baseRouter.use('/users', userRouter);

baseRouter.useAsync(
  '/periods',
  authMiddleware(UserRole.USER, ApiKeyAccess.LIMITED)
);
baseRouter.use('/periods', periodRouter);

baseRouter.useAsync(
  '/periodsettings',
  authMiddleware(UserRole.USER, ApiKeyAccess.LIMITED)
);
baseRouter.use('/periodsettings', periodsettingsRouter);

baseRouter.useAsync(
  '/praise',
  authMiddleware(UserRole.USER, ApiKeyAccess.LIMITED)
);
baseRouter.use('/praise', praiseRouter);

baseRouter.useAsync(
  '/eventlogs',
  authMiddleware(UserRole.USER, ApiKeyAccess.LIMITED)
);
baseRouter.use('/eventlogs', eventLogRouter);

/* ADMIN authentication */

baseRouter.useAsync(
  '/admin/users',
  authMiddleware(UserRole.ADMIN, ApiKeyAccess.FULL)
);
baseRouter.use('/admin/users', adminUserRouter);

baseRouter.useAsync(
  '/admin/periods',
  authMiddleware(UserRole.ADMIN, ApiKeyAccess.FULL)
);
baseRouter.use('/admin/periods', adminPeriodRouter);

baseRouter.useAsync(
  '/admin/periodsettings',
  authMiddleware(UserRole.ADMIN, ApiKeyAccess.FULL)
);
baseRouter.use('/admin/periodsettings', adminPeriodsettingsRouter);

baseRouter.useAsync(
  '/admin/settings',
  authMiddleware(UserRole.ADMIN, ApiKeyAccess.FULL)
);
baseRouter.use('/admin/settings', settingsAdminRouter);

/* NOT FOUND */

baseRouter.all('*', (req, res) => {
  res.status(404).json({
    status: NOT_FOUND,
    message: `Can't find ${req.originalUrl} on this server!`,
  });
});

export { baseRouter };
