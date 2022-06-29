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
import BreadCrumb from '@/components/BreadCrumb';
import { HasRole, ROLE_ADMIN } from '@/model/auth';
import {
  PeriodPageParams,
  SinglePeriod,
  useSinglePeriodQuery,
} from '@/model/periods';
import BackLink from '@/navigation/BackLink';
import PeriodDetailsComponent from '@/pages/Periods/Details/components/Details';
import { SubPageNav } from '@/navigation/SubPageNav';
import { InlineLabel } from '@/components/InlineLabel';
import PeriodNameForm from './components/PeriodNameForm';
import { QuantifierMessage } from './components/QuantifierMessage';
import QuantifierTable from './components/QuantifierTable';
import ReceiverTable from './components/ReceiverTable';
import PeriodSettingsForm from './components/PeriodSettingsForm';
import NavItem from '../../../navigation/NavItem';

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
      <PeriodDetailsComponent />
    </>
  );
};

const PeriodDetailPage = (): JSX.Element | null => {
  const { periodId } = useParams<PeriodPageParams>();
  const period = useRecoilValue(SinglePeriod(periodId));
  const isAdmin = useRecoilValue(HasRole(ROLE_ADMIN));
  const { path, url } = useRouteMatch();
  useSinglePeriodQuery(periodId);

  if (!period || !period.receivers) return null;

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

export default PeriodDetailPage;
