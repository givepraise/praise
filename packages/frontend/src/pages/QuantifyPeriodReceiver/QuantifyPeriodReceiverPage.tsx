import BreadCrumb from '@/components/BreadCrumb';
import { UserPseudonym } from '@/components/user/UserPseudonym';
import {
  PeriodAndReceiverPageParams,
  PeriodPageParams,
  PeriodQuantifierReceivers,
  SinglePeriod,
  usePeriodQuantifierPraiseQuery,
} from '@/model/periods';
import { SingleBooleanSetting } from '@/model/settings';
import BackLink from '@/navigation/BackLink';
import { getQuantificationReceiverStats } from '@/utils/periods';
import {
  faCalendarAlt,
  faCheckCircle,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import QuantifyTable from './components/QuantifyTable';

const PeriodBreadCrumb = (): JSX.Element | null => {
  const { periodId } = useParams<PeriodPageParams>();
  const period = useRecoilValue(SinglePeriod(periodId));
  if (!period) return null;
  return <BreadCrumb name={`Quantify / ${period.name}`} icon={faCalendarAlt} />;
};

const DoneLabel = (): JSX.Element => {
  return (
    <div className="pl-1 pr-1 ml-2 text-xs text-white no-underline bg-green-400 py-[3px] rounded inline-block relative top-[-1px]">
      <FontAwesomeIcon icon={faCheckCircle} size="1x" className="mr-2" />
      Done
    </div>
  );
};

const PeriodMessage = (): JSX.Element | null => {
  const { periodId, receiverId } = useParams<PeriodAndReceiverPageParams>();
  const { location } = useHistory();
  usePeriodQuantifierPraiseQuery(periodId, location.key);
  const usePseudonyms = useRecoilValue(
    SingleBooleanSetting('PRAISE_QUANTIFY_RECEIVER_PSEUDONYMS')
  );
  const quantifierReceiverData = getQuantificationReceiverStats(
    useRecoilValue(PeriodQuantifierReceivers(periodId)),
    receiverId
  );

  if (!quantifierReceiverData) return null;
  return (
    <>
      <h2>
        Receiver:{' '}
        {usePseudonyms ? (
          <UserPseudonym userId={receiverId} periodId={periodId} />
        ) : (
          quantifierReceiverData.receiverName
        )}
      </h2>
      <div>Number of praise items: {quantifierReceiverData.count}</div>
      <div>
        Items left to quantify:{' '}
        {quantifierReceiverData.count - quantifierReceiverData.done === 0 ? (
          <>
            0<DoneLabel />
          </>
        ) : (
          quantifierReceiverData.count - quantifierReceiverData.done
        )}
      </div>
    </>
  );
};

const QuantifyPeriodUserPage = (): JSX.Element => {
  const { periodId } = useParams<PeriodPageParams>();

  return (
    <>
      <React.Suspense fallback="Loading…">
        <PeriodBreadCrumb />
      </React.Suspense>
      <BackLink to={`/quantify/period/${periodId}`} />

      <div className="w-2/3 praise-box">
        <React.Suspense fallback="Loading…">
          <PeriodMessage />
        </React.Suspense>
      </div>

      <div className="praise-box">
        <React.Suspense fallback={null}>
          <QuantifyTable />
        </React.Suspense>
      </div>
    </>
  );
};

export default QuantifyPeriodUserPage;
