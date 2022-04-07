import FieldErrorMessage from '@/components/form/FieldErrorMessage';
import { Field } from 'react-final-form';
import { AxiosResponse, AxiosError } from 'axios';

const StringInput = (
  name: string,
  apiResponse: AxiosResponse<unknown> | AxiosError<unknown> | null
): JSX.Element => {
  return (
    <Field name={name} key={name}>
      {({ input }): JSX.Element => {
        return (
          <div>
            <input
              type="text"
              id={name}
              {...input}
              autoComplete="off"
              className="block w-full"
            />
            {apiResponse && (
              <FieldErrorMessage name="name" apiResponse={apiResponse} />
            )}
          </div>
        );
      }}
    </Field>
  );
};

export default StringInput;
