import { faTimes, faUser } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Dialog } from '@headlessui/react';
import { UserDto } from 'api/dist/user/types';
import { Field, Form } from 'react-final-form';
import { ValidationErrors } from 'final-form';
import { Button } from '@/components/ui/Button';
import { FieldErrorMessage } from '@/components/form/FieldErrorMessage';
import { UpdateProfileSubmitButton } from './UpdateProfileSubmitButton';

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
  return (
    <div className="flex justify-center">
      <div className="flex items-center justify-center min-h-screen">
        <Dialog.Overlay className="fixed inset-0 bg-black/30" />
        <div className="relative max-w-xl pb-16 mx-auto bg-white rounded dark:bg-slate-600 dark:text-white">
          <div className="flex justify-end p-6">
            <Button variant="round" onClick={onClose}>
              <FontAwesomeIcon icon={faTimes} size="1x" />
            </Button>
          </div>
          <div className="justify-center px-20">
            <div className="flex justify-center mb-7">
              <FontAwesomeIcon icon={faUser} size="2x" />
            </div>
            <Dialog.Title className="text-center mb-7">
              Edit Profile
            </Dialog.Title>
            <Dialog.Description className="text-center mb-7">
              Closing a period means no more quantifications can be performed. A
              closed period cannot be re-opened.
            </Dialog.Description>
            <Form
              onSubmit={onSave}
              validate={validate}
              initialValues={{
                username: user.username,
                rewardsEthAddress: user.rewardsEthAddress,
              }}
              render={({ handleSubmit }): JSX.Element => (
                <form
                  // eslint-disable-next-line @typescript-eslint/no-misused-promises
                  onSubmit={handleSubmit}
                  className="leading-loose"
                >
                  <div className="mb-6">
                    <Field name="username">
                      {({ input }): JSX.Element => (
                        <div className="mb-6">
                          <label className="block mb-2 text-lg font-bold">
                            Username
                          </label>
                          <input
                            type="text"
                            id="input-username"
                            {...input}
                            autoComplete="off"
                            placeholder="Username"
                            className="block w-full"
                          />
                          <FieldErrorMessage name="username" />
                        </div>
                      )}
                    </Field>
                    <Field name="rewardsEthAddress">
                      {({ input }): JSX.Element => (
                        <div className="mb-2">
                          <label className="block mb-1 text-lg font-bold">
                            Rewards Address
                          </label>
                          <p className="mb-2 leading-6 text-warm-gray-500">
                            Change to receive rewards payouts to a different eth
                            address than the identity address
                          </p>
                          <input
                            type="text"
                            id="input-rewardsEthAddress"
                            {...input}
                            autoComplete="off"
                            placeholder="Rewards Address"
                            className="block w-full"
                          />
                          <FieldErrorMessage name="rewardsEthAddress" />
                        </div>
                      )}
                    </Field>
                  </div>

                  <UpdateProfileSubmitButton />
                </form>
              )}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
