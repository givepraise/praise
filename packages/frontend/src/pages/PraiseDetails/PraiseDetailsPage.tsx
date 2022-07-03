import { faCalendarAlt } from '@fortawesome/free-solid-svg-icons';
import React from 'react';
import { useParams } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import { BreadCrumb } from '@/components/BreadCrumb';
import { SinglePeriodByDate } from '@/model/periods';
import { PraisePageParams, useSinglePraiseQuery } from '@/model/praise';
import { Praise } from '@/components/praise/Praise';
import { BackLink } from '@/navigation/BackLink';
import { PraiseDetailTable } from './components/PraiseDetailTable';

const PraiseDetailsPage = (): JSX.Element | null => {
  const { praiseId } = useParams<PraisePageParams>();
  const praise = useSinglePraiseQuery(praiseId);
  const period = useRecoilValue(SinglePeriodByDate(praise?.createdAt));
  const backLinkUrl =
    period?._id && praise?.receiver._id
      ? `/periods/${period?._id}/receiver/${praise?.receiver._id}`
      : '/';

  if (!praise) return null;

  return (
    <div className="praise-page">
      <BreadCrumb name={'Praise details'} icon={faCalendarAlt} />
      <BackLink to={backLinkUrl} />

      <React.Suspense fallback={null}>
        <div className="mb-5 praise-box">
          <Praise praise={praise} />
        </div>
      </React.Suspense>

      <div className="praise-box">
        <React.Suspense fallback={null}>
          <PraiseDetailTable />
        </React.Suspense>
      </div>
    </div>
  );
};

// eslint-disable-next-line import/no-default-export
export default PraiseDetailsPage;
