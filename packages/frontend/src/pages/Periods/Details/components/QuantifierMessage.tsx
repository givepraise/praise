import { faCalculator } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useHistory, useParams } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import { getQuantificationStats } from '@/utils/periods';
import { PeriodPageParams, PeriodQuantifierReceivers } from '@/model/periods';

export const QuantifierMessage = (): JSX.Element | null => {
  const { periodId } = useParams<PeriodPageParams>();
  const history = useHistory();
  const quantificationStats = getQuantificationStats(
    useRecoilValue(PeriodQuantifierReceivers(periodId))
  );

  if (!quantificationStats) return null;

  return (
    <div className="mb-5 praise-box-wide">
      <div>
        <div>
          <strong>You are a quantifier for this period!</strong>
          {quantificationStats ? (
            <div>
              Assigned number of praise items: {quantificationStats.count}
              <br />
              Items left to quantify:{' '}
              {quantificationStats.count - quantificationStats.done}
            </div>
          ) : null}
          <button
            className="block mt-5 praise-button"
            onClick={(): void => {
              history.push(`/periods/${periodId}/quantify`);
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
