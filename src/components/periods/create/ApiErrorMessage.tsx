import { getBackendErrors } from "@/store/api";
import { CreatePeriodApiResponse } from "@/store/periods";
import { useFormState } from "react-final-form";
import { useRecoilValue } from "recoil";

const ApiErrorMessage = () => {
  const { dirtySinceLastSubmit } = useFormState();
  const apiResponse = useRecoilValue(CreatePeriodApiResponse);

  // Form hasn't been submitted / no api response present
  if (!apiResponse || dirtySinceLastSubmit) return null;

  // Get both api errors and http errors
  const backendErrors = getBackendErrors(apiResponse);
  if (!backendErrors) return null;

  // API Error: Validation rules, etc
  if (backendErrors.apiError && backendErrors.apiError.errors.length === 0) {
    return <div className="text-red-500">{backendErrors.apiError.message}</div>;
  }

  // HTTP Error: 403, 500 ..
  if (backendErrors.httpError) {
    return <div className="text-red-500">{backendErrors.httpError.error}</div>;
  }

  // OK
  return null;
};

export default ApiErrorMessage;
