import { Field } from 'react-final-form';
import { AxiosResponse, AxiosError } from 'axios';
import { FieldErrorMessage } from '@/components/form/FieldErrorMessage';

interface BooleanInputParams {
  name: string;
  apiResponse: AxiosResponse<unknown> | AxiosError | null;
  disabled?: boolean;
}

export const BooleanInput = ({
  name,
  apiResponse,
  disabled,
}: BooleanInputParams): JSX.Element => {
  return (
    <Field name={name} key={name} type="checkbox">
      {({ input }): JSX.Element => {
        return (
          <>
            <input
              id={name}
              {...input}
              disabled={disabled || false}
              className="mb-2 ml-5"
            />
            {apiResponse && (
              <FieldErrorMessage name="name" apiResponse={apiResponse} />
            )}
          </>
        );
      }}
    </Field>
  );
};
