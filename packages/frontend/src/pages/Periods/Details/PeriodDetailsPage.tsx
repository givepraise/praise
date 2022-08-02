import { PeriodStatusType } from 'api/dist/period/types';
import {
  faBalanceScaleLeft,
  faHeartbeat,
  faCalendarAlt,
  faCog,
} from '@fortawesome/free-solid-svg-icons';
import React, { Suspense } from 'react';
import {
  useParams,
  useRouteMatch,
  Switch,
  Route,
  Redirect,
} from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import { BreadCrumb } from '@/components/BreadCrumb';
import { HasRole, ROLE_ADMIN } from '@/model/auth';
import {
  PeriodPageParams,
  useLoadSinglePeriodDetails,
  SinglePeriod,
  usePeriodQuantifierPraise,
} from '@/model/periods';
import { SubPageNav } from '@/navigation/SubPageNav';
import { InlineLabel } from '@/components/InlineLabel';
import { BackLink } from '@/navigation/BackLink';
import { NavItem } from '@/navigation/NavItem';
import { PeriodDetails } from './components/PeriodDetails';
import { PeriodNameForm } from './components/PeriodNameForm';
import { QuantifierMessage } from './components/QuantifierMessage';
import { QuantifierTable } from './components/QuantifierTable';
import { ReceiverTable } from './components/ReceiverTable';
import { PeriodSettingsForm } from './components/PeriodSettingsForm';

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
    <div className="praise-page-wide">
      <BreadCrumb name="Periods" icon={faCalendarAlt} />
      <BackLink to="/periods" />

      <React.Suspense fallback={null}>
        <div className="mb-5 praise-box-wide">
          <PeriodDetailHead />
        </div>
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

        <div className="px-0 praise-box">
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
        </div>
      </div>
    </div>
  );
};

// eslint-disable-next-line import/no-default-export
export default PeriodDetailsPage;
