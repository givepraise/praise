import { isApiResponseValidationError } from '@/model/api';
import { AxiosError, AxiosResponse } from 'axios';
import { useField } from 'react-final-form';

interface FieldErrorMessageProps {
  name: string;
  apiResponse: AxiosResponse<unknown> | AxiosError<unknown> | null;
}
const FieldErrorMessage = ({
  name,
  apiResponse,
}: FieldErrorMessageProps): JSX.Element | null => {
  // Subscribe to error messsages concerning specified field
  const {
    meta: { active, touched, error },
  } = useField(name, {
    subscription: { touched: true, error: true, active: true },
  });

  // Display api error message for matching field if form has not
  // been edited since last submit
  if (touched && isApiResponseValidationError(apiResponse)) {
    if (apiResponse.response?.data?.errors[name])
      return (
        <span className="text-red-500">
          {apiResponse.response.data.errors[name].message}
        </span>
      );
  }

  // Display client validation error
  return !active && touched && error ? (
    <span className="text-red-500">{error}</span>
  ) : null;
};

export default FieldErrorMessage;
