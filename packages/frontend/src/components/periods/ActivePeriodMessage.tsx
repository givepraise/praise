import { AllPeriods } from '@/model/periods';
import { formatDate } from '@/utils/date';
import { getActivePeriod } from '@/utils/periods';
import React from 'react';
import { useRecoilValue } from 'recoil';

export const ActivePeriodMessage = () => {
  const allPeriods = useRecoilValue(AllPeriods);

  const noPeriodMessage = 'There is no active quantification period.';

  if (!Array.isArray(allPeriods) || allPeriods.length === 0)
    return <div>{noPeriodMessage}</div>;

  const activePeriod = getActivePeriod(allPeriods);
  if (!activePeriod) return <div>{noPeriodMessage}</div>;

  return (
    <div>
      Current quantification period ends at: {formatDate(activePeriod.endDate)}
    </div>
  );
};
