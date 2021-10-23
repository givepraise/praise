import BackLink from "@/components/BackLink";
import BreadCrumb from "@/components/BreadCrumb";
import ApiErrorMessage from "@/components/periods/create/ApiErrorMessage";
import FieldErrorMessage from "@/components/periods/create/FieldErrorMessage";
import { PeriodDayPicker } from "@/components/periods/create/PeriodDayPicker";
import SubmitButton from "@/components/periods/create/SubmitButton";
import { isApiResponseOk } from "@/store/api";
import { Period, useCreatePeriod } from "@/store/periods";
import { DEFAULT_DATE_FORMAT } from "@/utils/date";
import { faCalendarAlt } from "@fortawesome/free-solid-svg-icons";
import { isMatch } from "date-fns";
import { ValidationErrors } from "final-form";
import React from "react";
import "react-day-picker/lib/style.css";
import { Field, Form } from "react-final-form";
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

const PeriodsForm = () => {
  const { createPeriod } = useCreatePeriod();
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
                  <FieldErrorMessage name="name" />
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
                  <FieldErrorMessage name="endDate" />
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
