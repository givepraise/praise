import { ActiveTokenSet, DecodedAccessToken } from '@/model/auth';
import ActivatePage from '@/pages/Activate/ActivatePage';
import ErrorPage from '@/pages/ErrorPage';
import LoginPage from '@/pages/Login/LoginPage';
import AuthenticatedLayout from '../layouts/AuthenticatedLayout';
import { Redirect, Route, Switch } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import { useAccount } from 'wagmi';

const Routes = (): JSX.Element => {
  const activeTokenSet = useRecoilValue(ActiveTokenSet);
  const decodedToken = useRecoilValue(DecodedAccessToken);
  const { data } = useAccount();

  return activeTokenSet && decodedToken?.ethereumAddress === data?.address ? (
    <Switch>
      <Route exact path="/activate">
        <ActivatePage />
      </Route>
      <Route exact path="/404">
        <ErrorPage error={{ message: 'Not found' }} />
      </Route>

      <AuthenticatedLayout />
    </Switch>
  ) : (
    <Switch>
      <Route exact path="/">
        <LoginPage />
      </Route>
      <Route exact path="/activate">
        <ActivatePage />
      </Route>
      <Route path="/*">
        <Redirect
          to={{
            pathname: '/',
          }}
        />
      </Route>
    </Switch>
  );
};

export default Routes;
