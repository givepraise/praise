import { ActiveTokenSet } from '@/model/auth';
import ActivatePage from '@/pages/Activate/ActivatePage';
import ErrorPage from '@/pages/ErrorPage';
import LoginPage from '@/pages/Login/LoginPage';
import AuthenticatedLayout from '../layouts/AuthenticatedLayout';
import { Redirect, Route, Switch } from 'react-router-dom';
import { useRecoilValue } from 'recoil';

interface LoggedInOnlyRouteProps {
  children: JSX.Element;
  exact?: boolean;
  path: string;
}
// A Route that requires user to be logged in
const LoggedInOnlyRoute = ({
  children,
  ...props
}: LoggedInOnlyRouteProps): JSX.Element => {
  const activeTokenSet = useRecoilValue(ActiveTokenSet);

  // ActiveTokenSet exists: Show content
  // ActiveTokenSet undefined: Unknown state => wait
  // Token null: Token doesn't exist => login
  return (
    <Route
      {...props}
      render={({ location }): JSX.Element | null =>
        activeTokenSet ? (
          children
        ) : (
          <Redirect
            to={{
              pathname: '/login',
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
      <Route exact path="/activate">
        <ActivatePage />
      </Route>
      <Route exact path="/login">
        <LoginPage />
      </Route>
      <Route exact path="/404">
        <ErrorPage error={{ message: 'Not found' }} />
      </Route>
      <LoggedInOnlyRoute path="/">
        <AuthenticatedLayout />
      </LoggedInOnlyRoute>
    </Switch>
  );
};

export default Routes;
