import { Route, Switch } from 'react-router-dom';
import { useRecoilState, useRecoilValue } from 'recoil';
import { useAccount } from 'wagmi';
import React, { useEffect } from 'react';
import { ActiveTokenSet, DecodedAccessToken } from '@/model/auth/auth';
import { MainLayout } from '../layouts/MainLayout';

const ActivatePage = React.lazy(() => import('@/pages/Activate/ActivatePage'));
const NotFoundPage = React.lazy(() => import('@/pages/NotFoundPage'));

export const Routes = (): JSX.Element => {
  const [tokenSet, setTokenSet] = useRecoilState(ActiveTokenSet);
  const decodedToken = useRecoilValue(DecodedAccessToken);
  const { address } = useAccount();

  // Clear ActiveTokenSet if ethereum address changes
  useEffect(() => {
    if (tokenSet && decodedToken?.identityEthAddress !== address) {
      setTokenSet(undefined);
    }
  }, [tokenSet, address, decodedToken?.identityEthAddress, setTokenSet]);

  return (
    <Switch>
      <Route exact path="/activate">
        <ActivatePage />
      </Route>
      <Route exact path="/404">
        <NotFoundPage />
      </Route>

      <MainLayout />
    </Switch>
  );
};
