import { DATE_FORMAT, parseDate, localizeAndFormatIsoDate } from '@/utils/date';
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
}

const DayInput = ({
  name,
  onChange,
  value,
  className = '',
  inputClassName = '',
}: Params): JSX.Element => {
  const { inputProps, dayPickerProps } = useInput({
    defaultSelected: value ? parseDate(value) : undefined,
    format: DATE_FORMAT,
    required: true,
  });

  // Determines if popup is visible
  const [pickerVisible, setPickerVisible] = useState<boolean>(false);

  const handleDayClick = (day: Date): void => {
    onChange(localizeAndFormatIsoDate(day.toISOString()));
    setPickerVisible(false);
  };

  return (
    <div className={`w-full ${className}`}>
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

      {pickerVisible && (
        <OutsideClickHandler
          onOutsideClick={(): void => void setPickerVisible(false)}
          active={pickerVisible}
        >
          <DayPicker
            {...dayPickerProps}
            className="absolute mt-1 p-2 border text-xs rounded-lg shadow-lg bg-gray-50 z-20"
            onDayClick={handleDayClick}
            selected={parseDate(value)}
          />
        </OutsideClickHandler>
      )}
    </div>
  );
};

export default DayInput;
