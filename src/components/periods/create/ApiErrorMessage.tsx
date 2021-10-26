import { getApiError, getHttpError } from "@/store/api";
import { CreatePeriodApiResponse } from "@/store/periods";
import { useFormState } from "react-final-form";
import { useRecoilValue } from "recoil";

const ApiErrorMessage = () => {
  const { dirtySinceLastSubmit } = useFormState();
  const apiResponse = useRecoilValue(CreatePeriodApiResponse);

  // Form hasn't been submitted / no api response present
  if (!apiResponse || dirtySinceLastSubmit) return null;

  // API Error: Validation rules, etc
  const apiError = getApiError(apiResponse);
  if (apiError && apiError.errors.length === 0) {
    return <div className="text-red-500">{apiError.message}</div>;
  }

  // HTTP Error: 403, 500 ..
  const httpError = getHttpError(apiResponse);
  if (httpError) {
    return <div className="text-red-500">{httpError.error}</div>;
  }

  // OK
  return null;
};

export default ApiErrorMessage;
