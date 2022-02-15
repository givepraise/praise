import { AllPeriods, useAllPeriodsQuery } from '@/model/periods';
import { useAllUsersQuery } from '@/model/users';
import { faPrayingHands } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { ReactElement } from 'react';
import { useRecoilValue } from 'recoil';
import { useAllSettingsQuery } from './model/settings';

// interface QuantifyPeriodLoaderProps {
//   periodId: string;
// }

// const QuantifyPeriodLoader = ({ periodId }: QuantifyPeriodLoaderProps) => {
//   usePeriodPraiseQuery(periodId);
//   return null;
// };

export const StartupLoader: React.FC = (): ReactElement | null => {
  useAllPeriodsQuery();
  useAllUsersQuery();
  useAllSettingsQuery();

  const periods = useRecoilValue(AllPeriods);
  console.log(periods);
  // const isQuantifier = useRecoilValue(HasRole('QUANTIFIER'));
  // if (!periods) return null;

  // if (isQuantifier) {
  //   return (
  //     <>
  //       {periods.map((period) =>
  //         period._id && period.status === 'QUANTIFY' ? (
  //           <QuantifyPeriodLoader periodId={period._id} key={period._id} />
  //         ) : null
  //       )}
  //     </>
  //   );
  // }

  return null;
};

export const LoadScreen: React.FC = (): ReactElement | null => {
  return (
    <div className="fixed top-0 left-0 z-50 block w-full h-full bg-white opacity-75">
      <span
        className="relative block w-0 h-0 mx-auto my-0 top-1/2"
        style={{ top: '50%' }}
      >
        <FontAwesomeIcon icon={faPrayingHands} size="5x" spin />
      </span>
    </div>
  );
};
