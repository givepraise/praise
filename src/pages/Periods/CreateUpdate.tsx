import BackLink from "@/components/BackLink";
import BreadCrumb from "@/components/BreadCrumb";
import { PeriodDayPicker } from "@/components/periods/PeriodDayPicker";
import { DEFAULT_DATE_FORMAT } from "@/utils/date";
import { faCalendarAlt } from "@fortawesome/free-solid-svg-icons";
import { isMatch } from "date-fns";
import { ValidationErrors } from "final-form";
import React from "react";
import "react-day-picker/lib/style.css";
import { Field, Form, useField, useFormState } from "react-final-form";

// Is only called if validate is successful
const onSubmit = async (values: Record<string, any>) => {
  window.alert(JSON.stringify(values));
};

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

const SubmitButton = () => {
  const { invalid } = useFormState();
  const className = invalid ? "praise-button-disabled" : "praise-button";
  return (
    <button type="submit" className={className}>
      Create period
    </button>
  );
};

const PeriodsForm = () => {
  return (
    <Form
      onSubmit={onSubmit}
      validate={validate}
      mutators={{
        setDate: (args, state, utils) => {
          utils.changeValue(state, "endDate", () => args);
        },
      }}
      render={({ handleSubmit }) => (
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
