import {
  faCalendarAlt,
  faCheck,
  faTimes,
  faTimesCircle,
  faUser,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Dialog } from '@headlessui/react';
import { UserDto } from 'api/dist/user/types';
import { Field, Form, useFormState } from 'react-final-form';
import React from 'react';
import { ValidationErrors } from 'final-form';
import { OutsideClickHandler } from '@/components/OutsideClickHandler';
import { Button } from '@/components/ui/Button';
import { FieldErrorMessage } from '@/components/form/FieldErrorMessage';
import { SubmitButton } from './SubmitButton';

interface PeriodCloseDialogProps {
  onClose(): void;
  onSave(values): void;
  user: UserDto;
}

const validate = (
  values: Record<string, string>
): ValidationErrors | Promise<ValidationErrors> => {
  const errors: ValidationErrors = {};

  // username validation
  if (values.username) {
    if (values.username.length < 3) {
      errors.username = 'Min 3 characters';
    }
    if (values.username.length > 64) {
      errors.username = 'Max 64 characters';
    }
  } else {
    errors.username = 'Required';
  }

  // rewardsEthAddress validation
  if (values.rewardsEthAddress) {
    if (values.rewardsEthAddress.length < 3) {
      errors.rewardsEthAddress = 'Min 3 characters';
    }
    if (values.rewardsEthAddress.length > 64) {
      errors.rewardsEthAddress = 'Max 64 characters';
    }
  } else {
    errors.rewardsEthAddress = 'Required';
  }

  return errors as ValidationErrors;
};

export const EditProfileDialog = ({
  onClose,
  onSave,
  user,
}: PeriodCloseDialogProps): JSX.Element => {
  // Is only called if validate is successful
  const onSubmit = (values: Record<string, string>, e): void => {
    e.preventDefault();
    console.log('HEREEE', values);
    onSave(values);
    // const response = await updatePeriod(periodUpdates);
    // if (isResponseOk(response)) {
    //   toast.success('Period name saved');
    //   return {};
    // }
    // if (response.response && isApiResponseValidationError(response)) {
    //   return (response.response.data as ApiErrorResponseData).errors;
    // }
    // toast.error('Period name save failed');
    // return { [FORM_ERROR]: 'Period name save failed' };
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <Dialog.Overlay className="fixed inset-0 bg-black/30" />
      <div className="relative max-w-xl pb-16 mx-auto bg-white rounded dark:bg-slate-600 dark:text-white">
        <div className="flex justify-end p-6">
          <Button variant="round" onClick={onClose}>
            <FontAwesomeIcon icon={faTimes} size="1x" />
          </Button>
        </div>
        <div className="px-20">
          <div className="flex justify-center mb-7">
            <FontAwesomeIcon icon={faUser} size="2x" />
          </div>
          <Dialog.Title className="text-center mb-7">Edit Profile</Dialog.Title>
          <Dialog.Description className="text-center mb-7">
            Closing a period means no more quantifications can be performed. A
            closed period cannot be re-opened.
          </Dialog.Description>
          <div className="flex justify-center">
            <Form
              onSubmit={onSubmit}
              validate={validate}
              initialValues={{
                username: user.nameRealized,
                rewardsEthAddress: user.rewardsEthAddress,
              }}
              render={({ handleSubmit }): JSX.Element => (
                <form onSubmit={void handleSubmit} className="leading-loose">
                  <div className="mb-3">
                    <Field name="username">
                      {({ input }): JSX.Element => (
                        <div className="mb-2">
                          <label className="block">Username</label>
                          <input
                            type="text"
                            id="input-username"
                            {...input}
                            autoComplete="off"
                            placeholder="Username"
                            className="block w-72"
                          />
                          <FieldErrorMessage name="username" />
                        </div>
                      )}
                    </Field>
                    <Field name="rewardsEthAddress">
                      {({ input }): JSX.Element => (
                        <div className="mb-2">
                          <label className="block">Rewards Address</label>
                          <input
                            type="text"
                            id="input-rewardsEthAddress"
                            {...input}
                            autoComplete="off"
                            placeholder="Rewards Address"
                            className="block w-72"
                          />
                          <FieldErrorMessage name="rewardsEthAddress" />
                        </div>
                      )}
                    </Field>
                  </div>

                  <SubmitButton />

                  {/* <Button
                    className="mt-4 bg-red-600"
                    // onClick={(): void => {
                    //   onSave();
                    // }}
                  >
                    <FontAwesomeIcon
                      className="mr-2"
                      icon={faCheck}
                      size="1x"
                    />
                    Save
                  </Button> */}
                </form>
              )}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
