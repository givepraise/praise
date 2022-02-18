import { ActiveUserId } from '@/model/auth';
import { SinglePeriod } from '@/model/periods';
import { getQuantifierData } from '@/utils/periods';
import { faCalculator } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useHistory, useParams } from 'react-router-dom';
import { useRecoilValue } from 'recoil';

export const QuantifierMessage = () => {
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
  const { periodId } = useParams() as any;
  const history = useHistory();
  const period = useRecoilValue(SinglePeriod(periodId));
  const userId = useRecoilValue(ActiveUserId);
  const quantifierData = getQuantifierData(period, userId);

  if (!quantifierData) return null;

  return (
    <div className="w-2/3 praise-box">
      <div>
        <div>
          <strong>You are a quantifier for this period!</strong>
          <br />
          Assigned number of praise items: {quantifierData.praiseCount}
          <br />
          Items left to quantify:{' '}
          {quantifierData.praiseCount - quantifierData.finishedCount}
          <button
            className="block mt-5 praise-button"
            onClick={() => {
              history.push(`/quantify/period/${periodId}`);
            }}
          >
            <FontAwesomeIcon icon={faCalculator} size="1x" className="mr-2" />
            Quantify
          </button>
        </div>
      </div>
    </div>
  );
};
