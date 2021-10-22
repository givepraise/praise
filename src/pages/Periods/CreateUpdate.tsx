import BackLink from "@/components/BackLink";
import BreadCrumb from "@/components/BreadCrumb";
import { PeriodDayPicker } from "@/components/periods/PeriodDayPicker";
import { getApiError, getHttpError, isApiResponseOk } from "@/store/api";
import { Period, useCreatePeriod } from "@/store/periods";
import { DEFAULT_DATE_FORMAT } from "@/utils/date";
import {
  faCalendarAlt,
  faCheckCircle,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { AxiosError, AxiosResponse } from "axios";
import { isMatch } from "date-fns";
import { ValidationErrors } from "final-form";
import React from "react";
import "react-day-picker/lib/style.css";
import { Field, Form, useField, useFormState } from "react-final-form";
import { useHistory } from "react-router-dom";

const validate = (
  values: Record<string, any>
): ValidationErrors | Promise<ValidationErrors> => {
  const errors = {} as any;

  // Name validation
  if (values.name) {
    if (values.name.length < 3) {
      errors.name = "Min 3 characters";
    }
    if (values.name.length > 64) {
      errors.name = "Max 64 characters";
    }
  } else {
    errors.name = "Required";
  }

  // End date validation
  if (values.endDate) {
    if (!isMatch(values.endDate, DEFAULT_DATE_FORMAT)) {
      errors.endDate = "Invalid date format";
    }
  } else {
    errors.endDate = "Required";
  }

  return errors as ValidationErrors;
};

interface ErrorMessageProps {
  name: string;
}
const ErrorMessage = ({ name }: ErrorMessageProps) => {
  // Subscribe to error messsages concerning specified field
  const {
    meta: { active, touched, error },
  } = useField(name, {
    subscription: { touched: true, error: true, active: true },
  });
  return !active && touched && error ? (
    <span className="text-red-500">{error}</span>
  ) : null;
};

const PeriodsForm = () => {
  const { createPeriod } = useCreatePeriod();
  const [apiResponse, setApiResponse] = React.useState<
    AxiosResponse<never> | AxiosError<never> | null
  >(null);
  const history = useHistory();

  // Is only called if validate is successful
  const onSubmit = async (values: Record<string, any>) => {
    // Selecting date from popup returns Array, setting manually
    // returns string
    const dateString =
      Array.isArray(values.endDate) && values.endDate.length > 0
        ? values.endDate[0]
        : values.endDate;
    const newPeriod: Period = {
      name: values.name,
      endDate: new Date(dateString).toISOString(),
    };

    const response = await createPeriod(newPeriod);
    if (isApiResponseOk(response)) {
      setTimeout(() => {
        history.goBack();
      }, 1000);
    }

    setApiResponse(response);
  };

  const SubmitButton = () => {
    const { invalid, submitting, submitSucceeded, dirtySinceLastSubmit } =
      useFormState();

    const disabled =
      invalid || submitting || (submitSucceeded && !dirtySinceLastSubmit);

    const className = disabled ? "praise-button-disabled" : "praise-button";

    return (
      <button type="submit" className={className} disabled={disabled}>
        {apiResponse && isApiResponseOk(apiResponse) ? (
          <>
            <FontAwesomeIcon
              icon={faCheckCircle}
              size="1x"
              className="inline-block mr-2"
            />
            Period created
          </>
        ) : submitting ? (
          "Creating…"
        ) : (
          "Create period"
        )}
      </button>
    );
  };

  const ApiErrorMessage = () => {
    const { dirtySinceLastSubmit } = useFormState();

    // Clear api error when user edits form
    React.useEffect(() => {
      if (dirtySinceLastSubmit) setApiResponse(null);
    }, [dirtySinceLastSubmit]);

    // Form hasn't been submitted / no api response present
    if (!apiResponse) return null;

    // HTTP Error: 403, 500 ..
    const httpError = getHttpError(apiResponse);
    if (httpError) {
      return <div className="text-red-500">{httpError.error}</div>;
    }

    // API Error: Validation rules, etc
    const apiError = getApiError(apiResponse);
    if (apiError) {
      return (
        <div className="text-red-500">
          {apiError.message}
          <ul>
            {apiError.errors.map((error, index) => (
              <li key={index} className="text-sm list-disc ml-7">
                {error}
              </li>
            ))}
          </ul>
        </div>
      );
    }

    // OK
    return null;
  };

  return (
    <Form
      onSubmit={onSubmit}
      validate={validate}
      mutators={{
        setDate: (args, state, utils) => {
          utils.changeValue(state, "endDate", () => args);
        },
      }}
      render={({ handleSubmit, submitError }) => (
        <form onSubmit={handleSubmit} className="leading-loose">
          <div className="mb-3">
            <Field name="name">
              {({ input, meta }) => (
                <div className="mb-2">
                  <label className="block">Period name</label>
                  <input
                    type="text"
                    {...input}
                    placeholder="e.g. May-June"
                    className="block w-72"
                  />
                  <ErrorMessage name="name" />
                </div>
              )}
            </Field>
            <Field name="endDate">
              {({ input, meta }) => (
                <div className="mb-5">
                  <label className="block">End date</label>
                  <input
                    type="text"
                    {...input}
                    placeholder="e.g. 2021-01-01"
                    className="block w-72"
                  />
                  <PeriodDayPicker />
                  <ErrorMessage name="endDate" />
                </div>
              )}
            </Field>
          </div>
          <ApiErrorMessage />

          <div className="mt-2">
            <SubmitButton />
          </div>
        </form>
      )}
    />
  );
};

const PeriodsCreateUpdatePage = () => {
  return (
    <>
      <BreadCrumb name="Quantification periods" icon={faCalendarAlt} />

      <BackLink />
      <div className="praise-box">
        <h2 className="mb-2">Create period</h2>
        <div className="mb-2">
          A new period begins where the last one ended and ends at{" "}
          <i>end date</i>.
        </div>
        <PeriodsForm />
      </div>
    </>
  );
};

export default PeriodsCreateUpdatePage;
