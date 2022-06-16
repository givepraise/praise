import { DATE_FORMAT, parseDate, formatIsoDateUTC } from '@/utils/date';
import OutsideClickHandler from '@/components/OutsideClickHandler';
import { useState } from 'react';
import { DayPicker, useInput } from 'react-day-picker';
import 'react-day-picker/dist/style.css';

interface Params {
  name: string;
  onChange: Function;
  value: string;
  className?: string;
  inputClassName?: string;
  tzLabel?: string;
}

const DayInput = ({
  name,
  onChange,
  value,
  className = '',
  inputClassName = '',
  tzLabel = '',
}: Params): JSX.Element => {
  const { inputProps, dayPickerProps } = useInput({
    defaultSelected: value ? parseDate(value) : undefined,
    format: DATE_FORMAT,
    required: true,
  });

  // Determines if popup is visible
  const [pickerVisible, setPickerVisible] = useState<boolean>(false);

  const handleDayClick = (day: Date): void => {
    console.log('day clicked is', day);
    onChange(formatIsoDateUTC(day.toISOString(), DATE_FORMAT));
    setPickerVisible(false);
  };

  return (
    <div className={`w-full ${className}`}>
      <div className="flex justify-start items-center">
        <input
          {...inputProps}
          type="text"
          name={name}
          value={value}
          autoComplete="off"
          placeholder="e.g. 2021-01-01"
          onFocus={(): void => void setPickerVisible(true)}
          className={inputClassName}
        />
        {tzLabel && <div className="mx-1">{tzLabel}</div>}
      </div>

      {pickerVisible && (
        <OutsideClickHandler
          onOutsideClick={(): void => void setPickerVisible(false)}
          active={pickerVisible}
        >
          <DayPicker
            {...dayPickerProps}
            className="absolute mt-1 p-2 border text-xs rounded-lg shadow-lg bg-warm-gray-50 z-20"
            onDayClick={handleDayClick}
            selected={parseDate(value)}
          />
        </OutsideClickHandler>
      )}
    </div>
  );
};

export default DayInput;
