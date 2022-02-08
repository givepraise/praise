import FieldErrorMessage from '@/components/form/FieldErrorMessage';
import OutsideClickHandler from '@/components/OutsideClickHandler';
import { PeriodDayPicker } from '@/components/periods/PeriodDayPicker';
import { isResponseOk } from '@/model/api';
import { SinglePeriod, useUpdatePeriod } from '@/model/periods';
import { DATE_FORMAT, formatDate } from '@/utils/date';
import { AxiosResponse } from 'axios';
import { isMatch, isSameDay } from 'date-fns';
import { ValidationErrors } from 'final-form';
import { default as React } from 'react';
import 'react-day-picker/lib/style.css';
import { Field, Form } from 'react-final-form';
import toast from 'react-hot-toast';
import { useParams } from 'react-router-dom';
import { useRecoilValue } from 'recoil';

const validate = (
  values: Record<string, any>
): ValidationErrors | Promise<ValidationErrors> => {
  const errors = {} as any;

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

const PeriodDateForm = () => {
  const { periodId } = useParams();

  const period = useRecoilValue(SinglePeriod({ periodId }));
  const [apiResponse, setApiResponse] = React.useState<AxiosResponse | null>(
    null
  );
  const { updatePeriod } = useUpdatePeriod();

  const inputRef = React.useRef<HTMLInputElement | null>(null);

  // Is only called if validate is successful
  const onSubmit = async (values: Record<string, any>) => {
    if (
      !period ||
      isSameDay(new Date(period.endDate), new Date(values.endDate))
    )
      return; // Only save if endDate has changed
    const newPeriod = { ...period };
    newPeriod.endDate = values.endDate;
    const response = await updatePeriod(newPeriod);
    if (isResponseOk(response)) toast.success('Period date saved');
    setApiResponse(response);
  };

  if (!period) return null;

  return (
    <Form
      onSubmit={onSubmit}
      validate={validate}
      mutators={{
        setDate: (args, state, utils) => {
          utils.changeValue(state, 'endDate', () => args);
          onSubmit(state.formState.values);
        },
      }}
      initialValues={{ endDate: formatDate(period.endDate) }}
      render={({ handleSubmit, submitSucceeded, form }) => (
        <form onSubmit={handleSubmit} className="leading-loose">
          <div>
            Period end:
            <Field name="endDate">
              {({ input, meta }) => (
                <>
                  <div className="inline-block ml-1">
                    <OutsideClickHandler
                      onOutsideClick={handleSubmit}
                      active={meta.active!}
                    >
                      <input
                        type="text"
                        id="input-period-date"
                        {...input}
                        ref={inputRef}
                        autoComplete="off"
                        placeholder="e.g. 2021-01-01"
                        className="relative left-[-5px] py-0 pl-1 my-0 text-sm bg-transparent border border-transparent hover:border-gray-300 w-28"
                      />
                      <PeriodDayPicker />
                    </OutsideClickHandler>
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

export default PeriodDateForm;
