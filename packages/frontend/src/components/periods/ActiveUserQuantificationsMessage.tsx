import { Link } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import {
  AllActiveUserQuantificationPeriods,
  useLoadAllQuantifyPeriodDetails,
} from '@/model/periods/periods';
import { PeriodDetailsDto } from '@/model/periods/dto/period-details.dto';

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
  useLoadAllQuantifyPeriodDetails();
  const activeUserQuantificationPeriods = useRecoilValue(
    AllActiveUserQuantificationPeriods
  );
  if (
    !activeUserQuantificationPeriods ||
    !Array.isArray(activeUserQuantificationPeriods) ||
    activeUserQuantificationPeriods.length === 0
  ) {
    return null;
  }

  return (
    <div>
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
