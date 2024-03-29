import { AxiosError, AxiosResponse } from 'axios';
import { isMatch } from 'date-fns';
import { ValidationErrors } from 'final-form';
import { default as React } from 'react';
import { Field, Form } from 'react-final-form';
import { toast } from 'react-hot-toast';
import { useParams } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import { DATE_FORMAT, formatIsoDateUTC } from '@/utils/date';
import {
  PeriodPageParams,
  SinglePeriod,
  useUpdatePeriod,
} from '@/model/periods/periods';
import { isResponseOk } from '@/model/api';
import { DayInput } from '@/components/form/DayInput';
import { FieldErrorMessage } from '@/components/form/FieldErrorMessage';

const validate = (
  values: Record<string, string>
): ValidationErrors | Promise<ValidationErrors> => {
  const errors: ValidationErrors = {};

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

export const PeriodDateForm = (): JSX.Element | null => {
  const { periodId } = useParams<PeriodPageParams>();
  const period = useRecoilValue(SinglePeriod(periodId));
  const [apiResponse, setApiResponse] = React.useState<
    AxiosResponse<unknown> | AxiosError | null
  >(null);
  const { updatePeriod } = useUpdatePeriod();

  // Is only called if validate is successful
  const onSubmit = async (values: Record<string, string>): Promise<void> => {
    if (!period) return; // Only save if endDate has changed
    const updates = {
      name: period.name,
      endDate: `${values.endDate}T23:59:59.999Z`,
    };

    const response = await updatePeriod(period._id, updates);
    if (response) {
      if (isResponseOk(response)) {
        toast.success('Period date saved');
      }
      setApiResponse(response);
    }
  };

  if (!period) return null;

  return (
    <Form
      onSubmit={onSubmit}
      validate={validate}
      mutators={{
        setDate: (args, state, utils): void => {
          utils.changeValue(state, 'endDate', () => args);
          void onSubmit(state.formState.values as Record<string, string>);
        },
      }}
      initialValues={{
        endDate: formatIsoDateUTC(period.endDate, DATE_FORMAT),
      }}
      render={({ handleSubmit }): JSX.Element => (
        <form onSubmit={void handleSubmit} className="leading-loose">
          <div>
            Period end:
            <Field name="endDate">
              {({ input }): JSX.Element => (
                <>
                  <div className="inline-block ml-1">
                    <DayInput
                      name={input.name}
                      value={input.value}
                      onChange={(e): void => {
                        input.onChange(e);
                        void handleSubmit(e);
                      }}
                      inputClassName="relative py-0 px-1 my-0 text-sm bg-transparent border border-transparent dark:border-transparent hover:border-warm-gray-300 w-[118px] dark:hover:border-slate-800 dark:bg-transparent"
                    />
                  </div>
                  <div>
                    <FieldErrorMessage
                      name="endDate"
                      apiResponse={apiResponse}
                    />
                  </div>
                </>
              )}
            </Field>
          </div>
        </form>
      )}
    />
  );
};
