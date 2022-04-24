import BreadCrumb from '@/components/BreadCrumb';
import { HasRole, ROLE_ADMIN } from '@/model/auth';
import { SinglePeriodByDate } from '@/model/periods';
import { PraisePageParams, useSinglePraiseQuery } from '@/model/praise';
import BackLink from '@/navigation/BackLink';
import { localizeAndFormatIsoDate, DATE_FORMAT_LONG } from '@/utils/date';
import { faCalendarAlt } from '@fortawesome/free-solid-svg-icons';
import React from 'react';
import { useParams } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import PraiseDetailTable from './components/PraiseDetailTable';
import getMarkdownText from '@/components/MarkdownText';
import { PraiseDetailsDto } from 'api/dist/praise/types';
import { PeriodDetailsDto } from 'api/dist/period/types';

interface Params {
  period?: PeriodDetailsDto;
  praise?: PraiseDetailsDto;
}

const PeriodReceiverMessage = ({
  period,
  praise,
}: Params): JSX.Element | null => {
  const isAdmin = useRecoilValue(HasRole(ROLE_ADMIN));

  if (!praise || !period) return null;

  return (
    <>
      <div className="text-gray-500">
        {localizeAndFormatIsoDate(praise.createdAt, DATE_FORMAT_LONG)}
      </div>
      <h2>
        {praise.giver.name} <span className="font-normal">to</span>{' '}
        {praise.receiver.name}
      </h2>
      <div
        className="mt-2"
        dangerouslySetInnerHTML={{
          __html: getMarkdownText(praise?.reasonRealized || praise.reason),
        }}
      ></div>
      <div className="mt-2">
        Id: {praise._id}
        {praise.forwarder && <div>Forwarded by: {praise.forwarder.name}</div>}
        {period && (period.status === 'CLOSED' || isAdmin) ? (
          <div>Score: {praise.scoreRealized}</div>
        ) : null}
      </div>
    </>
  );
};

const PraiseDetailsPage = (): JSX.Element => {
  const { praiseId } = useParams<PraisePageParams>();
  const praise = useSinglePraiseQuery(praiseId);
  const period = useRecoilValue(SinglePeriodByDate(praise?.createdAt));
  const backLinkUrl =
    period?._id && praise?.receiver._id
      ? `/period/${period?._id}/receiver/${praise?.receiver._id}`
      : '/';

  return (
    <div className="max-w-2xl mx-auto">
      <BreadCrumb name={'Praise details'} icon={faCalendarAlt} />
      <BackLink to={backLinkUrl} />

      <div className="praise-box">
        <React.Suspense fallback="Loading…">
          <PeriodReceiverMessage praise={praise} period={period} />
        </React.Suspense>
      </div>

      <div className="praise-box">
        <React.Suspense fallback="Loading…">
          <PraiseDetailTable />
        </React.Suspense>
      </div>
    </div>
  );
};

export default PraiseDetailsPage;
