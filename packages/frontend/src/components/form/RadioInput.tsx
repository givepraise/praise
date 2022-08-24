import { Field } from 'react-final-form';
import { AxiosResponse, AxiosError } from 'axios';
import { useState } from 'react';
import { FieldErrorMessage } from '@/components/form/FieldErrorMessage';

export const RadioInput = (
  name: string,
  apiResponse: AxiosResponse<unknown> | AxiosError | null,
  dbValue: string,
  values: string[],
  disabled?: boolean
): JSX.Element => {
  const [currentValue, setCurrentValue] = useState<string>(dbValue);

  return (
    <Field name={name} key={name} type="radio">
      {({ input }): JSX.Element => {
        return (
          <div>
            {values.map((value) => {
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
                    <span className="ml-2">{value}</span>
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
