import NotFoundPage from '@/pages/NotFoundPage';
import SettingsPage from '@/pages/Settings/SettingsPage';
import StartPage from '@/pages/Start/StartPage';
import { ActiveUserRoles, ROLE_ADMIN, ROLE_QUANTIFIER } from '@/model/auth';
import React from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';
import { difference } from 'lodash';
import { useRecoilValue } from 'recoil';

const MyPraisePage = React.lazy(() => import('@/pages/MyPraise/MyPraisePage'));
const UsersPage = React.lazy(() => import('@/pages/Users/UsersPage'));

const PeriodsPage = React.lazy(() => import('@/pages/Periods/PeriodsPage'));
const PeriodsCreateUpdatePage = React.lazy(
  () => import('@/pages/Periods/Create/PeriodCreatePage')
);
const PeriodDetailPage = React.lazy(
  () => import('@/pages/Periods/Details/PeriodDetailsPage')
);
const PeriodReceiverSummaryPage = React.lazy(
  () => import('@/pages/Periods/ReceiverSummary/ReceiverSummaryPage')
);

const PraiseDetailsPage = React.lazy(
  () => import('@/pages/PraiseDetails/PraiseDetailsPage')
);

const QuantifyPeriodPage = React.lazy(
  () => import('@/pages/QuantifyPeriod/QuantifyPeriodPage')
);
const QuantifyPage = React.lazy(
  () => import('@/pages/QuantifyPeriodReceiver/QuantifyPeriodReceiverPage')
);

const EventLogsPage = React.lazy(
  () => import('@/pages/EventLogs/EventLogsPage')
);

const FAQPage = React.lazy(() => import('@/pages/FAQ/FAQPage'));

interface AuthRouteProps {
  children: JSX.Element;
  userRoles: string[];
  path: string;
  exact?: boolean;
  roles?: string[];
}
// A Route that takes an array of roles as argument and redirects
// to frontpage if user do not belong to any of the given roles
const AuthRoute = ({
  children,
  userRoles,
  path,
  exact = false,
  roles = [],
}: AuthRouteProps): JSX.Element => {
  // Check if user.roles contain all required roles
  const hasRequiredRoles = difference(roles, userRoles).length === 0;

  return (
    <Route
      path={path}
      exact={exact}
      render={(): JSX.Element =>
        hasRequiredRoles ? (
          children
        ) : (
          <Redirect
            to={{
              pathname: '/',
            }}
          />
        )
      }
    />
  );
};

const AuthenticatedRoutes = (): JSX.Element | null => {
  const userRoles = useRecoilValue(ActiveUserRoles);

  return (
    <Switch>
      <Route path="/mypraise">
        <MyPraisePage />
      </Route>

      <AuthRoute userRoles={userRoles} roles={[ROLE_ADMIN]} path={'/pool'}>
        <UsersPage />
      </AuthRoute>

      <AuthRoute
        userRoles={userRoles}
        roles={[ROLE_ADMIN]}
        path={'/periods/createupdate'}
      >
        <PeriodsCreateUpdatePage />
      </AuthRoute>

      <Route path="/periods/:periodId/receiver/:receiverId">
        <PeriodReceiverSummaryPage />
      </Route>

      <Route exact path="/eventlogs">
        <EventLogsPage />
      </Route>

      <AuthRoute
        userRoles={userRoles}
        roles={[ROLE_QUANTIFIER]}
        path={'/periods/:periodId/quantify/receiver/:receiverId'}
      >
        <QuantifyPage />
      </AuthRoute>

      <AuthRoute
        userRoles={userRoles}
        roles={[ROLE_QUANTIFIER]}
        path={'/periods/:periodId/quantify'}
      >
        <QuantifyPeriodPage />
      </AuthRoute>

      <Route path={'/periods/:periodId'}>
        <PeriodDetailPage />
      </Route>

      <Route path={'/periods'}>
        <PeriodsPage />
      </Route>

      <Route path="/praise/:praiseId">
        <PraiseDetailsPage />
      </Route>

      <AuthRoute userRoles={userRoles} roles={[ROLE_ADMIN]} path={'/settings'}>
        <SettingsPage />
      </AuthRoute>

      <Route exact path="/">
        <StartPage />
      </Route>

      <Route exact path="/faq">
        <FAQPage />
      </Route>

      <Route path="/*">
        <NotFoundPage />
      </Route>
    </Switch>
  );
};

export default AuthenticatedRoutes;
