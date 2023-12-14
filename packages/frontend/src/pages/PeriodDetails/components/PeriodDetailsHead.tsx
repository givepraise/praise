import { InlineLabel } from '@/components/ui/InlineLabel';
import { HasRole, ROLE_ADMIN } from '@/model/auth/auth';
import {
  AllPeriods,
  PeriodPageParams,
  useLoadSinglePeriodDetails,
  SinglePeriod,
} from '@/model/periods/periods';
import { formatIsoDateUTC, DATE_FORMAT } from '@/utils/date';
import { getPreviousPeriod, hasPeriodEnded } from '@/utils/periods';
import { useParams } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import { CloseButton } from './CloseButton';
import { PeriodDateForm } from './PeriodDateForm';
import { PeriodNameForm } from './PeriodNameForm';
import { AssignButton } from './AssignButton';
import { SingleSetting } from '../../../model/settings/settings';

export const PeriodDetailsHead = (): JSX.Element | null => {
  const { periodId } = useParams<PeriodPageParams>();

  const allPeriods = useRecoilValue(AllPeriods);
  useLoadSinglePeriodDetails(periodId); // Fetch additional period details
  const period = useRecoilValue(SinglePeriod(periodId));
  const isAdmin = useRecoilValue(HasRole(ROLE_ADMIN));
  const directQuantEnabled = useRecoilValue(
    SingleSetting('DISCORD_BOT_DIRECT_PRAISE_QUANTIFICATION_ENABLED')
  );

  if (!period || !allPeriods) return null;

  const previousPeriod = getPreviousPeriod(allPeriods, period);

  if (!period) return <div>Period not found.</div>;

  return (
    <div>
      <div className={'float-right'}>
        {' '}
        <InlineLabel
          text={period?.status}
          className={
            period?.status === 'OPEN'
              ? 'bg-themecolor-alt-1/50'
              : period?.status === 'QUANTIFY'
              ? 'bg-themecolor-alt-1'
              : 'bg-themecolor-alt-1/30'
          }
        />
      </div>
      {isAdmin ? <PeriodNameForm /> : <h2>{period?.name}</h2>}

      <div>
        <span className="pr-2">Period start:</span>
        {previousPeriod
          ? formatIsoDateUTC(previousPeriod.endDate, DATE_FORMAT)
          : 'Dawn of time'}
      </div>
      {!isAdmin ? (
        <>
          <div>Period end: {formatIsoDateUTC(period.endDate, DATE_FORMAT)}</div>
          <div>Number of praise: {period.numberOfPraise}</div>
        </>
      ) : (
        <>
          <PeriodDateForm />
          <div>Number of praise: {period.numberOfPraise}</div>
          <div className="mt-5">
            {period.status === 'OPEN' || period.status === 'QUANTIFY' ? (
              <div className="flex items-center justify-between gap-10">
                {period.status === 'OPEN' &&
                period.receivers &&
                period?.receivers.length > 0 &&
                hasPeriodEnded(period) ? (
                  directQuantEnabled?.valueRealized ? (
                    <div className="max-w-md">
                      Direct quantification is enabled for this community which
                      means each praise is quantified by the praise giver at
                      praise time. Regular quantifications are disabled.
                    </div>
                  ) : (
                    <AssignButton />
                  )
                ) : null}

                <CloseButton />
              </div>
            ) : null}
          </div>
        </>
      )}
    </div>
  );
};
