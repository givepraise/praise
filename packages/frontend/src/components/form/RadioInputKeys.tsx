import { Field } from 'react-final-form';
import { AxiosResponse, AxiosError } from 'axios';
import { useState } from 'react';
import { FieldErrorMessage } from '@/components/form/FieldErrorMessage';

interface RadioInputParams {
  name: string;
  apiResponse: AxiosResponse<unknown> | AxiosError | null;
  dbValue: string;
  values: Record<string, string>;
  disabled?: boolean;
}

export const RadioInputKeys = ({
  name,
  apiResponse,
  dbValue,
  values,
  disabled,
}: RadioInputParams): JSX.Element => {
  const [currentValue, setCurrentValue] = useState<string>(dbValue);

  return (
    <Field name={name} key={name} type="radio">
      {({ input }): JSX.Element => {
        return (
          <div>
            {Object.entries(values).map(([value, label]) => {
              return (
                <div key={value}>
                  <label>
                    <input
                      id={value}
                      {...input}
                      className=""
                      value={value}
                      disabled={disabled || false}
                      checked={value === currentValue}
                      onClick={(): void => setCurrentValue(value)}
                    />
                    <span className="ml-2">{label}</span>
                  </label>
                  {apiResponse && (
                    <FieldErrorMessage name="name" apiResponse={apiResponse} />
                  )}
                </div>
              );
            })}
          </div>
        );
      }}
    </Field>
  );
};
