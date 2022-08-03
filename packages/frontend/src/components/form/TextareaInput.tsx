import { AxiosError, AxiosResponse } from 'axios';
import { Field } from 'react-final-form';

import { FieldErrorMessage } from '@/components/form/FieldErrorMessage';

export const TextareaInput = (
  name: string,
  apiResponse: AxiosResponse<unknown> | AxiosError | null
): JSX.Element => {
  return (
    <Field name={name} key={name}>
      {({ input }): JSX.Element => (
        <div>
          <textarea
            type="text"
            id={name}
            {...input}
            autoComplete="off"
            className="block w-full resize-y"
            rows={4}
          />
          {apiResponse && (
            <FieldErrorMessage name="name" apiResponse={apiResponse} />
          )}
        </div>
      )}
    </Field>
  );
};
