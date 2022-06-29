import { useState } from 'react';
import { DayPicker, useInput } from 'react-day-picker';
import { DATE_FORMAT, parseDate, formatIsoDateUTC } from '@/utils/date';
import OutsideClickHandler from '@/components/OutsideClickHandler';
import 'react-day-picker/dist/style.css';
import { classNames } from '@/utils/index';

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
    onChange(formatIsoDateUTC(day.toISOString(), DATE_FORMAT));
    setPickerVisible(false);
  };

  return (
    <div className={classNames('w-full', className)}>
      <div className="flex items-center justify-start">
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
            className="absolute z-20 p-2 mt-1 text-xs border rounded-lg shadow-lg bg-warm-gray-50"
            onDayClick={handleDayClick}
            selected={parseDate(value)}
          />
        </OutsideClickHandler>
      )}
    </div>
  );
};

export default DayInput;
