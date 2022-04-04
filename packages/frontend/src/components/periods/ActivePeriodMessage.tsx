import { AllPeriods } from '@/model/periods';
import { localizeAndFormatIsoDate } from '@/utils/date';
import { getActivePeriod } from '@/utils/periods';
import React, { ReactElement } from 'react';
import { useRecoilValue } from 'recoil';

export const ActivePeriodMessage: React.FC = (): ReactElement | null => {
  const allPeriods = useRecoilValue(AllPeriods);

  if (!Array.isArray(allPeriods) || allPeriods.length === 0) return null;

  const activePeriod = getActivePeriod(allPeriods);
  if (!activePeriod) return null;

  return (
    <div>
      Current quantification period ends at:{' '}
      {localizeAndFormatIsoDate(activePeriod.endDate)}
    </div>
  );
};
