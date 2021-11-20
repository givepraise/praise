import { ApiError, getApiError } from "@/store/api";
import { AxiosError, AxiosResponse } from "axios";
import { useField, useFormState } from "react-final-form";

const getApiErrorMessage = (apiError: ApiError, name: string) => {
  for (const error of apiError.errors) {
    const parts = error.split(":");
    if (parts[0] === name) return parts[1];
  }
  return null;
};

interface FieldErrorMessageProps {
  name: string;
  apiResponse: AxiosResponse | AxiosError | null;
}
const FieldErrorMessage = ({ name, apiResponse }: FieldErrorMessageProps) => {
  //const apiResponse = useRecoilValue(CreatePeriodApiResponse);
  const { dirtySinceLastSubmit } = useFormState();

  // Subscribe to error messsages concerning specified field
  const {
    meta: { active, touched, error },
  } = useField(name, {
    subscription: { touched: true, error: true, active: true },
  });

  // Display api error message for matching field if form has not
  // been edited since last submit
  const apiError = getApiError(apiResponse);
  if (!dirtySinceLastSubmit && apiError) {
    const apiErrorMessage = getApiErrorMessage(apiError, name);
    if (apiErrorMessage)
      return <span className="text-red-500">{apiErrorMessage}</span>;
  }

  // Display client validation error
  return !active && touched && error ? (
    <span className="text-red-500">{error}</span>
  ) : null;
};

export default FieldErrorMessage;
