import { ActiveTokenSet, DecodedAccessToken } from '@/model/auth';
import ActivatePage from '@/pages/Activate/ActivatePage';
import ErrorPage from '@/pages/ErrorPage';
import LoginPage from '@/pages/Login/LoginPage';
import AuthenticatedLayout from '../layouts/AuthenticatedLayout';
import { Redirect, Route, Switch } from 'react-router-dom';
import { useRecoilState, useRecoilValue } from 'recoil';
import { useAccount } from 'wagmi';
import { useEffect } from 'react';

const Routes = (): JSX.Element => {
  const [tokenSet, setTokenSet] = useRecoilState(ActiveTokenSet);
  const decodedToken = useRecoilValue(DecodedAccessToken);
  const { data } = useAccount();

  // Clear ActiveTokenSet if ethereum address changes
  useEffect(() => {
    if (tokenSet && decodedToken?.ethereumAddress !== data?.address) {
      setTokenSet(undefined);
    }
  }, [tokenSet, data?.address, decodedToken?.ethereumAddress, setTokenSet]);

  return tokenSet && decodedToken?.ethereumAddress === data?.address ? (
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
