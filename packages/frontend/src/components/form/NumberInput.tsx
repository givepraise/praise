import { Field } from 'react-final-form';
import { AxiosResponse, AxiosError } from 'axios';
import { FieldErrorMessage } from '@/components/form/FieldErrorMessage';

export const NumberInput = (
  name: string,
  apiResponse: AxiosResponse<unknown> | AxiosError | null,
  disabled?: boolean
): JSX.Element => {
  return (
    <Field name={name} key={name}>
      {({ input }): JSX.Element => (
        <div>
          <input
            type="number"
            id={name}
            {...input}
            autoComplete="off"
            className="block w-full"
            disabled={disabled || false}
          />
          {apiResponse && (
            <FieldErrorMessage name="name" apiResponse={apiResponse} />
          )}
        </div>
      )}
    </Field>
  );
};
