import { BreadCrumb } from '@/components/ui/BreadCrumb';
import { Page } from '@/components/ui/Page';
import { ActiveUserId, HasRole, ROLE_ADMIN } from '@/model/auth/auth';
import {
  PeriodPageParams,
  useLoadSinglePeriodDetails,
  SinglePeriod,
  usePeriodQuantifierPraise,
} from '@/model/periods/periods';
import { BackLink } from '@/navigation/BackLink';
import { NavItem } from '@/navigation/NavItem';
import { SubPageNav } from '@/navigation/SubPageNav';
import {
  faCalendarAlt,
  faHandsPraying,
  faHandHoldingHeart,
  faBalanceScaleLeft,
  faCog,
  faChartBar,
  faReceipt,
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
import { GiverReceiverTable } from './components/GiverReceiverTable';
import { PeriodDetailsHead } from './components/PeriodDetailsHead';
import { QuantifierMessage } from './components/QuantifierMessage';
import { Box } from '@/components/ui/Box';
import { LoadPlaceholder } from '@/components/LoadPlaceholder';
import { PeriodStatusType } from '@/model/periods/enums/period-status-type.enum';
import Attestations from './components/Attestations';

const QuantifierTable = React.lazy(
  () => import('./components/QuantifierTable')
);
const PeriodSettingsForm = React.lazy(
  () => import('./components/PeriodSettingsForm')
);
const Analytics = React.lazy(() => import('./components/Analytics'));

const PeriodDetailsHeadFallback = (): JSX.Element => {
  return (
    <Box className="mb-5" variant="wide">
      <LoadPlaceholder height={200} />
    </Box>
  );
};

export const PeriodDetailsPage = (): JSX.Element | null => {
  // Hooks
  const { periodId } = useParams<PeriodPageParams>();
  const detailsResponse = useLoadSinglePeriodDetails(periodId); // Load additional period details
  const { path, url } = useRouteMatch();

  // Global state
  const period = useRecoilValue(SinglePeriod(periodId));
  const activeUserId = useRecoilValue(ActiveUserId);
  const isAdmin = useRecoilValue(HasRole(ROLE_ADMIN));

  const periodQuantifierPraise = usePeriodQuantifierPraise(
    periodId,
    activeUserId || ''
  );

  if (!detailsResponse || !period || !activeUserId || !periodQuantifierPraise)
    return null;

  return (
    <Page variant={'wide'}>
      <BreadCrumb name="Periods" icon={faCalendarAlt} />
      <BackLink />

      <React.Suspense fallback={<PeriodDetailsHeadFallback />}>
        <Box variant={'wide'} className="mb-5">
          <PeriodDetailsHead />
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
                icon={faHandsPraying}
                replace
                rounded
              />
              <NavItem
                to={`${url}/givers`}
                description="Givers"
                icon={faHandHoldingHeart}
                replace
                rounded
              />
              <NavItem
                to={`${url}/quantifiers`}
                description="Quantifiers"
                icon={faBalanceScaleLeft}
                replace
              />
              {isAdmin && (
                <NavItem
                  to={`${url}/settings`}
                  description="Settings"
                  icon={faCog}
                  replace
                />
              )}
              <NavItem
                to={`${url}/analytics`}
                description="Analytics"
                icon={faChartBar}
                replace
                rounded
              />
              <NavItem
                to={`${url}/attestations`}
                description="Attestations"
                icon={faReceipt}
                replace
                rounded
              />
            </ul>
          </SubPageNav>
        </div>

        <Box className="px-0">
          <Suspense fallback={null}>
            <Switch>
              <Route path={`${path}/attestations`}>
                <Attestations />
              </Route>
              <Route path={`${path}/analytics`}>
                <Analytics />
              </Route>
              <Route path={`${path}/receivers`}>
                <GiverReceiverTable type="receiver" />
              </Route>
              <Route path={`${path}/givers`}>
                <GiverReceiverTable type="giver" />
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
