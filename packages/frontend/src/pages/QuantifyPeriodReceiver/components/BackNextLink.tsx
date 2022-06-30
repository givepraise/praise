import { UserPseudonym } from '@/components/user/UserPseudonym';
import { PeriodQuantifierReceivers } from '@/model/periods';
import { usePeriodSettingValueRealized } from '@/model/periodsettings';
import { faArrowLeft, faArrowRight } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Link } from 'react-router-dom';
import { useRecoilValue } from 'recoil';

interface Props {
  periodId: string;
  receiverId: string;
}
export const QuantifyBackNextLink = ({
  periodId,
  receiverId,
}: Props): JSX.Element | null => {
  const receivers = useRecoilValue(PeriodQuantifierReceivers(periodId));
  const usePseudonyms = usePeriodSettingValueRealized(
    periodId,
    'PRAISE_QUANTIFY_RECEIVER_PSEUDONYMS'
  ) as boolean;

  let backReceiver, forwardReceiver;

  if (!receivers) return null;
  const i = receivers.findIndex((r) => r.receiverId === receiverId);

  if (i > 0) {
    backReceiver = receivers[i - 1];
  }

  if (i < receivers.length - 1) {
    forwardReceiver = receivers[i + 1];
  }

  return (
    <div className="grid grid-cols-2 px-5 mt-5">
      <div className="text-left">
        {backReceiver && (
          <Link
            replace
            to={`/periods/${periodId}/quantify/receiver/${backReceiver.receiverId}`}
          >
            <FontAwesomeIcon icon={faArrowLeft} size="1x" className="mr-2" />
            {usePseudonyms ? (
              <UserPseudonym
                userId={backReceiver.receiverId}
                periodId={periodId}
              />
            ) : (
              backReceiver.receiverName
            )}
          </Link>
        )}
      </div>
      <div className="text-right">
        {forwardReceiver && (
          <Link
            replace
            to={`/periods/${periodId}/quantify/receiver/${forwardReceiver.receiverId}`}
          >
            {usePseudonyms ? (
              <UserPseudonym
                userId={forwardReceiver.receiverId}
                periodId={periodId}
              />
            ) : (
              forwardReceiver.receiverName
            )}
            <FontAwesomeIcon icon={faArrowRight} size="1x" className="ml-2" />
          </Link>
        )}
      </div>
    </div>
  );
};
