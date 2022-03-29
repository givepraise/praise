import FieldErrorMessage from '@/components/form/FieldErrorMessage';
import { Field } from 'react-final-form';
import { AxiosResponse, AxiosError } from 'axios';

const BooleanInput = (
  name: string,
  apiResponse: AxiosResponse<unknown> | AxiosError<unknown> | null
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

export default BooleanInput;
