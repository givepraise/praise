import { AxiosError, AxiosResponse } from 'axios';
import { useField } from 'react-final-form';

interface FieldErrorMessageProps {
  name: string;
  apiResponse?: AxiosResponse<unknown> | AxiosError | null;
}

export const FieldErrorMessage = ({
  name,
}: FieldErrorMessageProps): JSX.Element | null => {
  // Subscribe to error messsages concerning specified field
  const {
    meta: { touched, error, submitError },
  } = useField(name, {
    subscription: {
      touched: true,
      error: true,
      active: true,
      submitError: true,
      dirtySinceLastSubmit: true,
    },
  });

  return touched && (error || submitError) ? (
    <div className="mt-3 leading-normal text-red-500">
      {submitError ? submitError.message : error}
    </div>
  ) : null;
};
