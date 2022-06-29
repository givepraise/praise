import { Field } from 'react-final-form';
import { AxiosResponse, AxiosError } from 'axios';
import FieldErrorMessage from '@/components/form/FieldErrorMessage';

const NumberInput = (
  name: string,
  apiResponse: AxiosResponse<unknown> | AxiosError<unknown> | null
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
          />
          {apiResponse && (
            <FieldErrorMessage name="name" apiResponse={apiResponse} />
          )}
        </div>
      )}
    </Field>
  );
};

export default NumberInput;
