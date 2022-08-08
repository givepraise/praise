import {
  faBalanceScaleLeft,
  faCalendarAlt,
  faCog,
  faHeartbeat,
} from '@fortawesome/free-solid-svg-icons';
import { PeriodStatusType } from 'api/dist/period/types';
import React, { Suspense } from 'react';
import {
  Redirect,
  Route,
  Switch,
  useParams,
  useRouteMatch,
} from 'react-router-dom';
import { useRecoilValue } from 'recoil';

import { BreadCrumb } from '@/components/ui/BreadCrumb';
import { InlineLabel } from '@/components/ui/InlineLabel';
import { Box } from '@/components/ui/Box';
import { Page } from '@/components/ui/Page';
import { HasRole, ROLE_ADMIN } from '@/model/auth';
import {
  PeriodPageParams,
  SinglePeriod,
  useLoadSinglePeriodDetails,
  usePeriodQuantifierPraise,
} from '@/model/periods';
import { BackLink } from '@/navigation/BackLink';
import { NavItem } from '@/navigation/NavItem';
import { SubPageNav } from '@/navigation/SubPageNav';

import { PeriodDetails } from './components/PeriodDetails';
import { PeriodNameForm } from './components/PeriodNameForm';
import { PeriodSettingsForm } from './components/PeriodSettingsForm';
import { QuantifierMessage } from './components/QuantifierMessage';
import { QuantifierTable } from './components/QuantifierTable';
import { ReceiverTable } from './components/ReceiverTable';

const PeriodDetailHead = (): JSX.Element => {
  const { periodId } = useParams<PeriodPageParams>();
  const isAdmin = useRecoilValue(HasRole(ROLE_ADMIN));
  const period = useRecoilValue(SinglePeriod(periodId));
  return (
    <>
      <div className={'float-right'}>
        {' '}
        <InlineLabel
          text={period?.status as string}
          className={
            period?.status === 'OPEN'
              ? 'bg-themecolor-alt-1/50'
              : period?.status === 'QUANTIFY'
              ? 'bg-themecolor-alt-1'
              : 'bg-themecolor-alt-1/30'
          }
        />
      </div>
      {isAdmin ? <PeriodNameForm /> : <h2>{period?.name}</h2>}
      <PeriodDetails />
    </>
  );
};

export const PeriodDetailsPage = (): JSX.Element | null => {
  const { periodId } = useParams<PeriodPageParams>();
  const detailsResponse = useLoadSinglePeriodDetails(periodId); // Load additional period details
  const period = useRecoilValue(SinglePeriod(periodId));
  const periodQuantifierPraise = usePeriodQuantifierPraise(periodId);
  const isAdmin = useRecoilValue(HasRole(ROLE_ADMIN));
  const { path, url } = useRouteMatch();

  if (!detailsResponse || !period || !periodQuantifierPraise) return null;

  return (
    <Page variant={'wide'}>
      <BreadCrumb name="Periods" icon={faCalendarAlt} />
      <BackLink to="/periods" />

      <React.Suspense fallback={null}>
        <Box variant={'wide'} classes="mb-5">
          <PeriodDetailHead />
        </Box>
      </React.Suspense>

      <React.Suspense fallback={null}>
        <QuantifierMessage />
      </React.Suspense>

      <div className="flex flex-col space-y-5 xl:space-x-5 xl:flex-row xl:space-y-0">
        <div>
          <SubPageNav>
            <ul>
              <NavItem
                to={`${url}/receivers`}
                description="Receivers"
                icon={faHeartbeat}
              />
              <NavItem
                to={`${url}/quantifiers`}
                description="Quantifiers"
                icon={faBalanceScaleLeft}
              />
              <NavItem
                to={`${url}/settings`}
                description="Settings"
                icon={faCog}
              />
            </ul>
          </SubPageNav>
        </div>

        <Box classes="px-0">
          <Suspense fallback={null}>
            <Switch>
              <Route path={`${path}/receivers`}>
                <ReceiverTable />
              </Route>
              <Route path={`${path}/quantifiers`}>
                <QuantifierTable />
              </Route>
              <Route path={`${path}/settings`}>
                <PeriodSettingsForm
                  periodId={periodId}
                  disabled={period.status !== PeriodStatusType.OPEN || !isAdmin}
                />
              </Route>
              <Route path={`${path}`}>
                <Redirect to={`${url}/receivers`} />
              </Route>
            </Switch>
          </Suspense>
        </Box>
      </div>
    </Page>
  );
};

// eslint-disable-next-line import/no-default-export
export default PeriodDetailsPage;
