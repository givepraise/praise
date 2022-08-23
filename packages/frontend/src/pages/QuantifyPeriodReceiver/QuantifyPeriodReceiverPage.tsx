import {
  faCalendarAlt,
  faCheckCircle,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';
import { useParams } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import { BreadCrumb } from '@/components/ui/BreadCrumb';
import { UserPseudonym } from '@/components/user/UserPseudonym';
import {
  PeriodAndReceiverPageParams,
  PeriodPageParams,
  PeriodQuantifierReceivers,
  SinglePeriod,
  usePeriodQuantifierPraise,
} from '@/model/periods';
import { SinglePeriodSettingValueRealized } from '@/model/periodsettings';
import { getQuantificationReceiverStats } from '@/utils/periods';
import { BackLink } from '@/navigation/BackLink';
import { Box } from '@/components/ui/Box';
import { Page } from '@/components/ui/Page';
import { ActiveUserId } from '@/model/auth';
import { QuantifyTable } from './components/QuantifyTable';

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
  const usePseudonyms = useRecoilValue(
    SinglePeriodSettingValueRealized({
      periodId,
      key: 'PRAISE_QUANTIFY_RECEIVER_PSEUDONYMS',
    })
  ) as boolean;
  const activeUserId = useRecoilValue(ActiveUserId);
  const quantifierReceiverData = getQuantificationReceiverStats(
    useRecoilValue(
      PeriodQuantifierReceivers({ periodId, quantifierId: activeUserId || '' })
    ),
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
          quantifierReceiverData.receiver.name
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

const QuantifyPeriodReceiverPage = (): JSX.Element => {
  const { periodId, receiverId } = useParams<PeriodAndReceiverPageParams>();
  const activeUserId = useRecoilValue(ActiveUserId);
  usePeriodQuantifierPraise(periodId, activeUserId || '');

  return (
    <Page variant={'wide'}>
      <React.Suspense fallback={null}>
        <PeriodBreadCrumb />
      </React.Suspense>
      <BackLink />

      <React.Suspense fallback={null}>
        <Box className="mb-5" variant={'wide'}>
          <PeriodMessage />
        </Box>
      </React.Suspense>

      <React.Suspense fallback={null}>
        <QuantifyTable
          key={`${periodId}-${receiverId}`}
          periodId={periodId}
          receiverId={receiverId}
        />
      </React.Suspense>
    </Page>
  );
};

// eslint-disable-next-line import/no-default-export
export default QuantifyPeriodReceiverPage;
