import { faCalendarAlt } from '@fortawesome/free-solid-svg-icons';
import { isMatch } from 'date-fns';
import { FORM_ERROR, SubmissionErrors, ValidationErrors } from 'final-form';
import React from 'react';
import { Field, Form } from 'react-final-form';
import { useHistory } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { DATE_FORMAT } from '@/utils/date';
import { useCreatePeriod } from '@/model/periods/periods';
import { isApiResponseValidationError, isResponseOk } from '@/model/api';
import { DayInput } from '@/components/form/DayInput';
import { FieldErrorMessage } from '@/components/form/FieldErrorMessage';
import { BreadCrumb } from '@/components/ui/BreadCrumb';
import { BackLink } from '@/navigation/BackLink';
import { Box } from '@/components/ui/Box';
import { Page } from '@/components/ui/Page';
import { SubmitButton } from './components/SubmitButton';
import { CreatePeriodInputDto } from '@/model/periods/dto/period-create.dto';
import { ApiErrorResponseData } from 'shared/interfaces/api-error-reponse-data.interface';

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

  const history = useHistory();

  // Is only called if validate is successful
  const onSubmit = async (
    values: Record<string, string>
  ): Promise<SubmissionErrors> => {
    const newPeriod: CreatePeriodInputDto = {
      name: values.name,

      // Ensures the creator user see's a matching 'End Date' to the day they selected:
      //  - modify selected date to include the end-of-day time in UTC
      endDate: `${values.endDate}T23:59:59.999Z`,
    };

    const response = await createPeriod(newPeriod);

    if (isResponseOk(response)) {
      toast.success('Period created');
      setTimeout(() => {
        history.goBack();
      }, 2000);
      return {};
    }
    if (isApiResponseValidationError(response) && response.response) {
      return (response.response.data as ApiErrorResponseData).errors;
    }
    toast.error('Period create failed');
    return { [FORM_ERROR]: 'Period create failed' };
  };

  return (
    <Form
      onSubmit={onSubmit}
      validate={validate}
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
                  <FieldErrorMessage name="name" />
                </div>
              )}
            </Field>
            <Field name="endDate">
              {({ input }): JSX.Element => (
                <div className="mb-5 w-72">
                  <label className="block">End date (UTC)</label>
                  <DayInput
                    name={input.name}
                    value={input.value}
                    onChange={input.onChange}
                    className="block w-72"
                    inputClassName="w-full"
                  />
                  <FieldErrorMessage name="endDate" />
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
    <Page>
      <BreadCrumb name="Quantification periods" icon={faCalendarAlt} />
      <BackLink />

      <Box>
        <h2 className="mb-2">Create period</h2>
        <div className="mb-2">
          A new period begins where the last one ended, and finishes at
          end-of-day on <i>end date</i>.
        </div>
        <React.Suspense fallback={null}>
          <PeriodsForm />
        </React.Suspense>
      </Box>
    </Page>
  );
};

// eslint-disable-next-line import/no-default-export
export default PeriodsCreatePage;
