import {
  PeriodActiveQuantifierQuantifications,
  SinglePeriod,
} from '@/model/periods';
import { faCalculator } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { useRecoilValue } from 'recoil';

export const QuantifierMessage = () => {
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
  const { periodId } = useParams() as any;
  const history = useHistory();
  const period = useRecoilValue(SinglePeriod({ periodId }));
  const quantificationData = useRecoilValue(
    PeriodActiveQuantifierQuantifications({ periodId })
  );

  if (!period) return null;

  return quantificationData ? (
    <div className="w-2/3 praise-box">
      <div>
        <div>
          <strong>You are a quantifier for this period!</strong>
          <br />
          Assigned number of praise items: {quantificationData.count}
          <br />
          Items left to quantify:{' '}
          {quantificationData.count - quantificationData.done}
          <button
            className="block mt-5 praise-button"
            onClick={() => {
              if (period?._id) {
                history.push(`/quantify/period/${period._id}`);
              }
            }}
          >
            <FontAwesomeIcon icon={faCalculator} size="1x" className="mr-2" />
            Quantify
          </button>
        </div>
      </div>
    </div>
  ) : null;
};
