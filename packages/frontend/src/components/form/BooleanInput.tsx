import { AxiosError, AxiosResponse } from 'axios';
import { Field } from 'react-final-form';

import { FieldErrorMessage } from '@/components/form/FieldErrorMessage';

export const BooleanInput = (
  name: string,
  apiResponse: AxiosResponse<unknown> | AxiosError | null
): JSX.Element => {
  return (
    <Field name={name} key={name} type="checkbox">
      {({ input }): JSX.Element => {
        return (
          <div>
            <input id={name} {...input} />
            {apiResponse && (
              <FieldErrorMessage name="name" apiResponse={apiResponse} />
            )}
          </div>
        );
      }}
    </Field>
  );
};
