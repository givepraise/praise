import { isApiResponseError } from '@/model/api';
import { AxiosError, AxiosResponse } from 'axios';
import { useField, useFormState } from 'react-final-form';

interface FieldErrorMessageProps {
  name: string;
  apiResponse: AxiosResponse | AxiosError | null;
}
const FieldErrorMessage = ({ name, apiResponse }: FieldErrorMessageProps) => {
  const { dirtySinceLastSubmit } = useFormState();

  // Subscribe to error messsages concerning specified field
  const {
    meta: { active, touched, error },
  } = useField(name, {
    subscription: { touched: true, error: true, active: true },
  });

  // Display api error message for matching field if form has not
  // been edited since last submit
  if (apiResponse && isApiResponseError(apiResponse)) {
    if (!dirtySinceLastSubmit && apiResponse.response) {
      if (apiResponse.response.status === 400) {
        if (apiResponse.response.data[name])
          return (
            <span className="text-red-500">
              {apiResponse.response.data[name]}
            </span>
          );
      }
    }
  }

  // Display client validation error
  return !active && touched && error ? (
    <span className="text-red-500">{error}</span>
  ) : null;
};

export default FieldErrorMessage;
