import { AllActiveUserQuantificationPeriods } from '@/model/periods';
import { PeriodDetailsDto } from 'shared/dist/period/types';
import { Link } from 'react-router-dom';
import { useRecoilValue } from 'recoil';

interface QuantifierPeriodMessageProps {
  period: PeriodDetailsDto;
}
const QuantifierPeriodMessage = ({
  period,
}: QuantifierPeriodMessageProps): JSX.Element | null => {
  if (!period?._id) return null;
  return (
    <li key={period._id}>
      <Link to={`/periods/${period._id}/quantify`}>{period.name}</Link>
    </li>
  );
};

export const ActiveUserQuantificationsMessage = (): JSX.Element | null => {
  const activeUserQuantificationPeriods = useRecoilValue(
    AllActiveUserQuantificationPeriods
  );
  if (
    !activeUserQuantificationPeriods ||
    !Array.isArray(activeUserQuantificationPeriods) ||
    activeUserQuantificationPeriods.length === 0
  )
    return null;

  return (
    <div className="mt-2">
      Quantification is open! You can perform quantifications for the following
      periods:
      <ul className="list-disc list-inside">
        {activeUserQuantificationPeriods.map((period) => (
          <QuantifierPeriodMessage period={period} key={period._id} />
        ))}
      </ul>
    </div>
  );
};
