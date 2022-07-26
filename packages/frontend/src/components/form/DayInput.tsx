import { ChangeEvent } from 'react';
import { classNames } from '@/utils/index';

interface Params {
  name: string;
  onChange: Function;
  value: string;
  className?: string;
  inputClassName?: string;
}

export const DayInput = ({
  name,
  onChange: parentOnChange,
  value,
  className = '',
  inputClassName = '',
}: Params): JSX.Element => {
  const onChange = (event: ChangeEvent<HTMLInputElement>): void => {
    parentOnChange(event.target.value);
  };

  return (
    <div className={classNames('w-full', className)}>
      <div className="flex items-center justify-start">
        <input
          type="date"
          name={name}
          value={value}
          onChange={onChange}
          className={inputClassName}
        />
      </div>
    </div>
  );
};
