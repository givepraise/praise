import { useParams } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import { PeriodPageParams, SinglePeriod } from '@/model/periods/periods';
import { PeriodStatusType } from '@/model/periods/enums/period-status-type.enum';

const Attestations = (): JSX.Element => {
  const { periodId } = useParams<PeriodPageParams>();
  const period = useRecoilValue(SinglePeriod(periodId));
  if (!period || period.status !== PeriodStatusType.CLOSED) {
    return (
      <div className="flex items-center justify-center w-full h-full">
        Analytics are available after quantification when the period is closed.
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-2 px-5">
      <h2>Attestations</h2>
    </div>
  );
};

// eslint-disable-next-line import/no-default-export
export default Attestations;
