import BreadCrumb from '@/components/BreadCrumb';
import { HasRole, ROLE_ADMIN } from '@/model/auth';
import { SinglePeriodByDate } from '@/model/periods';
import { useSinglePraiseQuery } from '@/model/praise';
import BackLink from '@/navigation/BackLink';
import { formatDateLong } from '@/utils/date';
import { faCalendarAlt } from '@fortawesome/free-solid-svg-icons';
import React from 'react';
import { useParams } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import PraiseDetailTable from './components/PraiseDetailTable';

const PeriodReceiverMessage = () => {
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
  const { praiseId } = useParams() as any;
  const praise = useSinglePraiseQuery(praiseId);
  const period = useRecoilValue(SinglePeriodByDate(praise?.createdAt));
  const isAdmin = useRecoilValue(HasRole(ROLE_ADMIN));

  if (!praise) return null;

  return (
    <>
      <div className="text-gray-500">{formatDateLong(praise.createdAt)}</div>
      <h2>
        {praise.giver.name} <span className="font-normal">to</span>{' '}
        {praise.receiver.name}
      </h2>
      <div className="mt-2">{praise.reason}</div>
      <div className="mt-2">
        Id: {praise._id}
        {period && (period.status === 'CLOSED' || isAdmin) ? (
          <>
            <br />
            Average praise score: {praise.score}
          </>
        ) : null}
      </div>
    </>
  );
};

const QuantSummaryPraisePage = () => {
  return (
    <>
      <BreadCrumb name={'Praise details'} icon={faCalendarAlt} />
      <BackLink />

      <div className="w-2/3 praise-box">
        <React.Suspense fallback="Loading…">
          <PeriodReceiverMessage />
        </React.Suspense>
      </div>

      <div className="praise-box">
        <React.Suspense fallback="Loading…">
          <PraiseDetailTable />
        </React.Suspense>
      </div>
    </>
  );
};

export default QuantSummaryPraisePage;
