import ApiErrorMessage from "@/components/form/ApiErrorMessage";
import FieldErrorMessage from "@/components/form/FieldErrorMessage";
import OutsideClickHandler from "@/components/OutsideClickHandler";
import {
  SinglePeriod,
  UpdatePeriodApiResponse,
  useAllPeriodsQuery,
  useUpdatePeriod,
} from "@/model/periods";
import { ValidationErrors } from "final-form";
import { default as React } from "react";
import "react-day-picker/lib/style.css";
import { Field, Form } from "react-final-form";
import { useParams } from "react-router-dom";
import { useRecoilState, useRecoilValue } from "recoil";

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

  return errors as ValidationErrors;
};

const PeriodNameForm = () => {
  let { id } = useParams() as any;

  useAllPeriodsQuery(); // Make sure that all periods are fetched
  const period = useRecoilValue(SinglePeriod({ periodId: id }));
  const [apiResponse, setApiResponse] = useRecoilState(UpdatePeriodApiResponse);
  const { updatePeriod } = useUpdatePeriod();

  const inputRef = React.useRef<HTMLInputElement | null>(null);

  // Is only called if validate is successful
  const onSubmit = async (values: Record<string, any>) => {
    if (!period || period === values.name) return; // Only save if name has changed
    setApiResponse(null); // Clear any old API error messages
    const newPeriod = { ...period };
    newPeriod.name = values.name;
    updatePeriod(newPeriod);
  };

  if (!period) return null;

  return (
    <Form
      onSubmit={onSubmit}
      validate={validate}
      initialValues={{ name: period.name }}
      render={({ handleSubmit, submitSucceeded, form }) => (
        <form onSubmit={handleSubmit} className="leading-loose">
          <div className="mb-3">
            <Field name="name">
              {({ input, meta }) => (
                <div className="mb-2">
                  <OutsideClickHandler
                    onOutsideClick={handleSubmit}
                    active={meta.active!}
                  >
                    <input
                      type="text"
                      {...input}
                      autoComplete="off"
                      ref={inputRef}
                      placeholder="e.g. May-June"
                      className="relative left-[-5px] pl-1 text-xl font-semibold bg-transparent border border-transparent hover:border-gray-300"
                      onKeyDown={(e) => {
                        switch (e.key) {
                          case "Tab":
                            handleSubmit();
                            break;
                          case "Enter":
                            handleSubmit();
                            inputRef.current?.blur();
                            break;
                          case "Escape":
                            form.reset();
                            inputRef.current?.blur();
                            break;
                        }
                      }}
                    />
                  </OutsideClickHandler>
                  <FieldErrorMessage name="name" apiResponse={apiResponse} />
                </div>
              )}
            </Field>
          </div>
          {submitSucceeded && <ApiErrorMessage apiResponse={apiResponse} />}
        </form>
      )}
    />
  );
};

export default PeriodNameForm;
