import React, { useEffect } from 'react';
import {
  useRecoilState,
  atom,
  useRecoilValue,
  useSetRecoilState,
} from 'recoil';
import { AllPeriods } from '../model/periods/periods';
import { getPeriodDatesConfig } from '../model/report/util/get-period-dates-config';
import { toast } from 'react-hot-toast';
import { SelectInput, SelectInputOption } from './form/SelectInput';

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
  const [startDate, setStartDate] = React.useState<Date>();
  const [endDate, setEndDate] = React.useState<Date>();
  const [exportedStartDate, setExportedStartDate] = useRecoilState(
    DatePeriodRangeStartDate
  );
  const [exportedEndDate, setExportedEndDate] = useRecoilState(
    DatePeriodRangeEndDate
  );

  // Set latest period as default if no startDate or endDate is set
  useEffect(() => {
    if (!exportedStartDate && !exportedEndDate && allPeriods.length > 0) {
      const latestPeriod = allPeriods[0];
      setPeriodId(latestPeriod._id);
    }
  }, [exportedStartDate, exportedEndDate, allPeriods, setPeriodId]);

  // Set startDate and endDate when periodId changes
  useEffect(() => {
    if (periodId) {
      try {
        const dates = getPeriodDatesConfig(allPeriods, periodId);
        if (!dates) return;
        setStartDate(new Date(dates.startDate));
        setEndDate(new Date(dates.endDate));
        setExportedStartDate(new Date(dates.startDate));
        setExportedEndDate(new Date(dates.endDate));
      } catch (err) {
        toast.error((err as Error).message);
      }
    }
  }, [
    periodId,
    setStartDate,
    setEndDate,
    allPeriods,
    setExportedEndDate,
    setExportedStartDate,
  ]);

  const handleStartDateChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ): void => {
    const d = new Date(event.target.value);
    if (endDate && d < endDate) {
      setStartDate(d);
    }
  };

  const handleEndDateChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ): void => {
    const d = new Date(event.target.value);
    if (startDate && d > startDate) {
      setEndDate(d);
    }
  };

  const handleDateInputBlur = (): void => {
    if (startDate && endDate) {
      setExportedStartDate(startDate);
      setExportedEndDate(endDate);
    }
  };

  const periodOptions: SelectInputOption[] = [
    { value: '', label: 'Period', disabled: true },
    ...allPeriods.map((period) => {
      return { value: period._id, label: period.name };
    }),
  ];

  return (
    <div className="w-full p-5 mb-5 text-sm border rounded-none shadow-none md:shadow-md md:rounded-xl bg-warm-gray-50 dark:bg-slate-600 break-inside-avoid-column">
      <div className="sm:flex sm:justify-start sm:space-x-5">
        <div className="flex items-center">Period:</div>
        <SelectInput
          handleChange={(e): void => {
            setPeriodId(e.value);
          }}
          selected={periodOptions.find((o) => o.value === periodId)}
          options={periodOptions}
          className="text-sm min-w-[200px]"
        />
        <div className="flex flex-row pt-3 sm:pt-0">
          <div className="flex items-center hidden sm:visible">or dates:</div>
          <input
            type="date"
            value={startDate ? startDate.toISOString().substr(0, 10) : ''}
            onChange={handleStartDateChange}
            onBlur={handleDateInputBlur}
            className="w-full text-sm"
          />
          <div className="flex items-center px-3">to</div>
          <input
            type="date"
            value={endDate ? endDate.toISOString().substr(0, 10) : ''}
            onChange={handleEndDateChange}
            onBlur={handleDateInputBlur}
            className="w-full text-sm"
          />
        </div>
      </div>
    </div>
  );
};
