import React, { useEffect } from 'react';
import { useRecoilState, atom, useRecoilValue } from 'recoil';
import { AllPeriods } from '../../../model/periods/periods';
import { getPeriodDatesConfig } from '../../../model/report/util/get-period-dates-config';
import { toast } from 'react-hot-toast';

export const DatePeriodRangePeriod = atom<string>({
  key: 'DatePeriodRangePeriod',
  default: '',
});

export const DatePeriodRangeStartDate = atom<Date | null>({
  key: 'DatePeriodRangeStartDate',
  default: null,
});

export const DatePeriodRangeEndDate = atom<Date | null>({
  key: 'DatePeriodRangeEndDate',
  default: null,
});

export const DatePeriodRange: React.FC = () => {
  const allPeriods = useRecoilValue(AllPeriods);
  const [periodId, setPeriodId] = useRecoilState(DatePeriodRangePeriod);
  const [startDate, setStartDate] = useRecoilState(DatePeriodRangeStartDate);
  const [endDate, setEndDate] = useRecoilState(DatePeriodRangeEndDate);

  // Set latest period as default if no startDate or endDate is set
  useEffect(() => {
    if (!startDate && !endDate && allPeriods.length > 0) {
      const latestPeriod = allPeriods[0];
      setPeriodId(latestPeriod._id);
    }
  }, [allPeriods, endDate, setPeriodId, startDate]);

  // Set startDate and endDate when periodId changes
  useEffect(() => {
    if (periodId) {
      try {
        const dates = getPeriodDatesConfig(allPeriods, periodId);
        if (!dates) return;
        setStartDate(new Date(dates.startDate));
        setEndDate(new Date(dates.endDate));
      } catch (err) {
        toast.error((err as Error).message);
      }
    }
  }, [periodId, setStartDate, setEndDate, allPeriods]);

  const handleStartDateChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ): void => {
    setPeriodId('');
    setStartDate(new Date(event.target.value));
  };

  const handleEndDateChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ): void => {
    setPeriodId('');
    setEndDate(new Date(event.target.value));
  };

  return (
    <div className="w-full p-5 mb-5 text-sm border rounded-none shadow-none md:shadow-md md:rounded-xl bg-warm-gray-50 dark:bg-slate-600 break-inside-avoid-column">
      <div className="flex justify-start space-x-5">
        <div className="flex items-center">Select a period:</div>
        <select
          value={periodId}
          onChange={(e): void => setPeriodId(e.target.value)}
          className="text-sm"
        >
          <option value="" disabled>
            Period
          </option>
          {allPeriods.map((period) => {
            return (
              <option key={period._id} value={period._id}>
                {period.name}
              </option>
            );
          })}
        </select>
        <div className="flex items-center">or dates:</div>
        <input
          type="date"
          value={startDate ? startDate.toISOString().substr(0, 10) : ''}
          onChange={handleStartDateChange}
        />
        <div className="flex items-center">to</div>
        <input
          type="date"
          value={endDate ? endDate.toISOString().substr(0, 10) : ''}
          onChange={handleEndDateChange}
        />
      </div>
    </div>
  );
};
