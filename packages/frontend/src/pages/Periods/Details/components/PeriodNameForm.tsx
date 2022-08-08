import { FORM_ERROR, SubmissionErrors, ValidationErrors } from 'final-form';
import { default as React } from 'react';
import { Field, Form } from 'react-final-form';
import { toast } from 'react-hot-toast';
import { useParams } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import { ApiErrorResponseData } from 'api/dist/error/types';
import {
  PeriodPageParams,
  SinglePeriod,
  useUpdatePeriod,
} from '@/model/periods';
import { isApiResponseValidationError, isResponseOk } from '@/model/api';
import { OutsideClickHandler } from '@/components/OutsideClickHandler';
import { FieldErrorMessage } from '@/components/form/FieldErrorMessage';

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

  return errors as ValidationErrors;
};

export const PeriodNameForm = (): JSX.Element | null => {
  const { periodId } = useParams<PeriodPageParams>();
  const period = useRecoilValue(SinglePeriod(periodId));
  const { updatePeriod } = useUpdatePeriod();

  const inputRef = React.useRef<HTMLInputElement | null>(null);

  // Is only called if validate is successful
  const onSubmit = async (
    values: Record<string, string>
  ): Promise<SubmissionErrors> => {
    if (!period || period.name === values.name) return; // Only save if name has changed
    const periodUpdates = { _id: period._id, name: values.name };

    const response = await updatePeriod(periodUpdates);
    if (isResponseOk(response)) {
      toast.success('Period name saved');
      return {};
    }
    if (response.response && isApiResponseValidationError(response)) {
      return (response.response.data as ApiErrorResponseData).errors;
    }
    toast.error('Period name save failed');
    return { [FORM_ERROR]: 'Period name save failed' };
  };

  if (!period) return null;

  return (
    <Form
      onSubmit={onSubmit}
      validate={validate}
      initialValues={{ name: period.name }}
      render={({ handleSubmit, form }): JSX.Element => (
        <form onSubmit={void handleSubmit} className="leading-loose">
          <div className="mb-3">
            <Field name="name">
              {({ input, meta }): JSX.Element => (
                <div className="mb-2">
                  <OutsideClickHandler
                    onOutsideClick={void handleSubmit}
                    active={meta.active ? true : false}
                  >
                    <input
                      type="text"
                      {...input}
                      autoComplete="off"
                      ref={inputRef}
                      placeholder="e.g. May-June"
                      className="relative left-[-5px] pl-1 w-1/2 text-xl font-semibold bg-transparent border border-transparent dark:border-transparent hover:border-warm-gray-300 dark:hover:border-slate-800 dark:bg-transparent"
                      onKeyDown={(e): void => {
                        switch (e.key) {
                          case 'Tab':
                            void handleSubmit();
                            break;
                          case 'Enter':
                            void handleSubmit();
                            inputRef.current?.blur();
                            break;
                          case 'Escape':
                            form.reset();
                            inputRef.current?.blur();
                            break;
                        }
                      }}
                    />
                  </OutsideClickHandler>
                  <FieldErrorMessage name="name" />
                </div>
              )}
            </Field>
          </div>
        </form>
      )}
    />
  );
};
