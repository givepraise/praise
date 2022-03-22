import BreadCrumb from '@/components/BreadCrumb';
import FieldErrorMessage from '@/components/form/FieldErrorMessage';
import { PeriodDayPicker } from '@/components/periods/PeriodDayPicker';
import { isResponseOk } from '@/model/api';
import { CreatePeriodApiResponse, useCreatePeriod } from '@/model/periods';
import BackLink from '@/navigation/BackLink';
import { DATE_FORMAT } from '@/utils/date';
import { faCalendarAlt } from '@fortawesome/free-solid-svg-icons';
import { PeriodCreateInput } from 'api/dist/period/types';
import { isMatch } from 'date-fns';
import { ValidationErrors } from 'final-form';
import React from 'react';
import 'react-day-picker/lib/style.css';
import { Field, Form } from 'react-final-form';
import { useHistory } from 'react-router-dom';
import { useRecoilState } from 'recoil';
import SubmitButton from './components/SubmitButton';

const validate = (
  values: Record<string, string>
): ValidationErrors | Promise<ValidationErrors> => {
  const errors: ValidationErrors = {};

  // Name validation
  if (values.name) {
    if (values.name.length < 3) {
      errors.name = 'Min 3 characters';
    }
    if (values.name.length > 64) {
      errors.name = 'Max 64 characters';
    }
  } else {
    errors.name = 'Required';
  }

  // End date validation
  if (values.endDate) {
    if (!isMatch(values.endDate, DATE_FORMAT)) {
      errors.endDate = 'Invalid date format';
    }
  } else {
    errors.endDate = 'Required';
  }

  return errors as ValidationErrors;
};

const PeriodsForm = (): JSX.Element => {
  const { createPeriod } = useCreatePeriod();
  const [apiResponse, setApiResponse] = useRecoilState(CreatePeriodApiResponse);

  const history = useHistory();

  // Is only called if validate is successful
  const onSubmit = async (values: Record<string, string>): Promise<void> => {
    // Selecting date from popup returns Array, setting manually
    // returns string
    const dateString =
      Array.isArray(values.endDate) && values.endDate.length > 0
        ? values.endDate[0]
        : values.endDate;
    const newPeriod: PeriodCreateInput = {
      name: values.name,
      endDate: new Date(dateString).toISOString(),
    };

    const response = await createPeriod(newPeriod);
    if (isResponseOk(response)) {
      setTimeout(() => {
        history.goBack();
        setApiResponse(null); // Clear API response when navigating away
      }, 1000);
    }
  };

  return (
    <Form
      onSubmit={onSubmit}
      validate={validate}
      mutators={{
        setDate: (args, state, utils): void => {
          utils.changeValue(state, 'endDate', () => args);
        },
      }}
      render={({ handleSubmit }): JSX.Element => (
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        <form onSubmit={handleSubmit} className="leading-loose">
          <div className="mb-3">
            <Field name="name">
              {({ input }): JSX.Element => (
                <div className="mb-2">
                  <label className="block">Period name</label>
                  <input
                    type="text"
                    id="input-period-name"
                    {...input}
                    autoComplete="off"
                    placeholder="e.g. May-June"
                    className="block w-72"
                  />
                  {apiResponse && (
                    <FieldErrorMessage name="name" apiResponse={apiResponse} />
                  )}
                </div>
              )}
            </Field>
            <Field name="endDate">
              {({ input }): JSX.Element => (
                <div className="mb-5">
                  <label className="block">End date</label>
                  <input
                    type="text"
                    id="input-period-date"
                    {...input}
                    autoComplete="off"
                    placeholder="e.g. 2021-01-01"
                    className="block w-72"
                  />
                  <PeriodDayPicker />
                  {apiResponse && (
                    <FieldErrorMessage
                      name="endDate"
                      apiResponse={apiResponse}
                    />
                  )}
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

const PeriodsCreatePage = (): JSX.Element => {
  return (
    <>
      <BreadCrumb name="Quantification periods" icon={faCalendarAlt} />
      <BackLink to="/periods" />

      <div className="praise-box">
        <h2 className="mb-2">Create period</h2>
        <div className="mb-2">
          A new period begins where the last one ended and ends at{' '}
          <i>end date</i>.
        </div>
        <React.Suspense fallback="Loading…">
          <PeriodsForm />
        </React.Suspense>
      </div>
    </>
  );
};

export default PeriodsCreatePage;
