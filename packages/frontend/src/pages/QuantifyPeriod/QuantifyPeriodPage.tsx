import { faCalendarAlt } from '@fortawesome/free-solid-svg-icons';
import React from 'react';
import { useParams } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import { BreadCrumb } from '@/components/ui/BreadCrumb';
import {
  PeriodPageParams,
  PeriodQuantifierReceivers,
  SinglePeriod,
  usePeriodQuantifierPraise,
} from '@/model/periods';
import { getQuantificationStats } from '@/utils/periods';
import { BackLink } from '@/navigation/BackLink';
import { Box } from '@/components/ui/Box';
import { Page } from '@/components/ui/Page';
import { QuantifyPeriodTable } from './components/QuantifyPeriodTable';

const PeriodMessage = (): JSX.Element => {
  const { periodId } = useParams<PeriodPageParams>();
  const period = useRecoilValue(SinglePeriod(periodId));
  const quantificationStats = getQuantificationStats(
    useRecoilValue(PeriodQuantifierReceivers(periodId))
  );

  return (
    <>
      <h2>{period?.name}</h2>
      {quantificationStats ? (
        <div>
          Assigned number of praise items: {quantificationStats.count}
          <br />
          Items left to quantify:{' '}
          {quantificationStats.count - quantificationStats.done}
        </div>
      ) : null}
    </>
  );
};

const QuantifyPeriodPage = (): JSX.Element | null => {
  const { periodId } = useParams<PeriodPageParams>();
  const period = useRecoilValue(SinglePeriod(periodId));
  const periodQuantifierPraise = usePeriodQuantifierPraise(periodId);

  if (!period || !periodQuantifierPraise) return null;

  return (
    <Page>
      <BreadCrumb name="Quantify" icon={faCalendarAlt} />
      <BackLink />

      <React.Suspense fallback={null}>
        <Box className="mb-5">
          <PeriodMessage />
        </Box>
      </React.Suspense>

      <React.Suspense fallback={null}>
        <Box className="px-0">
          <QuantifyPeriodTable />
        </Box>
      </React.Suspense>
    </Page>
  );
};

// eslint-disable-next-line import/no-default-export
export default QuantifyPeriodPage;
