import { StartupLoader } from '../startupLoader';
import NotFoundPage from '@/pages/NotFoundPage';
import SettingsPage from '@/pages/Settings/SettingsPage';
import StartPage from '@/pages/Start/StartPage';
import { ROLE_ADMIN, ROLE_QUANTIFIER, ActiveUserRoles } from '@/model/auth';
import React from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import AuthenticatedLayout from '../layouts/AuthenticatedLayout';

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

interface AuthRouteProps {
  children: JSX.Element;
  exact?: boolean;
  path: string;
  roles: string[];
}
// A Route that takes an array of roles as argument and redirects
// to frontpage if user do not belong to any of the given roles
const AuthRoute = ({ children, ...props }: AuthRouteProps): JSX.Element => {
  const userRoles = useRecoilValue(ActiveUserRoles);

  let authenticated = false;
  for (const role of props.roles) {
    if (userRoles?.includes(role)) {
      authenticated = true;
      break;
    }
  }

  return (
    <Route
      {...props}
      render={({ location }): JSX.Element =>
        authenticated ? (
          children
        ) : (
          <Redirect
            to={{
              pathname: '/',
              state: { from: location },
            }}
          />
        )
      }
    />
  );
};

const Routes = (): JSX.Element => {
  return (
    <Switch>
      <Route path="/mypraise">
        <MyPraisePage />
      </Route>

      <AuthRoute roles={[ROLE_ADMIN]} path={'/pool'}>
        <UsersPage />
      </AuthRoute>

      <AuthRoute roles={[ROLE_ADMIN]} path={'/periods/createupdate'}>
        <PeriodsCreateUpdatePage />
      </AuthRoute>

      <Route path="/periods/:periodId/receiver/:receiverId">
        <PeriodReceiverSummaryPage />
      </Route>

      <Route exact path="/eventlogs">
        <EventLogsPage />
      </Route>

      <AuthRoute
        roles={[ROLE_QUANTIFIER]}
        path={'/periods/:periodId/quantify/receiver/:receiverId'}
      >
        <QuantifyPage />
      </AuthRoute>

      <AuthRoute roles={[ROLE_QUANTIFIER]} path={'/periods/:periodId/quantify'}>
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

      <AuthRoute roles={[ROLE_ADMIN]} path={'/settings'}>
        <SettingsPage />
      </AuthRoute>

      <Route exact path="/">
        <StartPage />
      </Route>

      <Route path="/*">
        <NotFoundPage />
      </Route>
    </Switch>
  );
};

const AuthenticatedRoutes = (): JSX.Element => {
  return (
    <>
      <StartupLoader />
      <AuthenticatedLayout>
        <Routes />
      </AuthenticatedLayout>
    </>
  );
};

export default AuthenticatedRoutes;
