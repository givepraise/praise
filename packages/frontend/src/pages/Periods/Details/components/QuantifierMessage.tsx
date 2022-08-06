import { faCalculator } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { PeriodStatusType } from 'api/dist/period/types';
import { useHistory, useParams } from 'react-router-dom';
import { useRecoilValue } from 'recoil';

import { PraiseButton } from '@/components/ui/PraiseButton';
import {
  PeriodPageParams,
  PeriodQuantifierReceivers,
  SinglePeriod,
} from '@/model/periods';
import { getQuantificationStats } from '@/utils/periods';
import { PraiseBox } from '@/components/ui/PraiseBox';

export const QuantifierMessage = (): JSX.Element | null => {
  const { periodId } = useParams<PeriodPageParams>();
  const period = useRecoilValue(SinglePeriod(periodId));
  const history = useHistory();
  const quantificationStats = getQuantificationStats(
    useRecoilValue(PeriodQuantifierReceivers(periodId))
  );

  if (period?.status !== PeriodStatusType.QUANTIFY || !quantificationStats)
    return null;

  return (
    <PraiseBox variant={'wide'} classes="mb-5">
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
          <PraiseButton
            classes="block mt-5"
            onClick={(): void => {
              history.push(`/periods/${periodId}/quantify`);
            }}
          >
            <FontAwesomeIcon icon={faCalculator} size="1x" className="mr-2" />
            Quantify
          </PraiseButton>
        </div>
      </div>
    </PraiseBox>
  );
};
