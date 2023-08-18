import { faTimes, faUser } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Dialog } from '@headlessui/react';
import { Field, Form } from 'react-final-form';
import { ValidationErrors } from 'final-form';
import { Button } from '@/components/ui/Button';
import { FieldErrorMessage } from '@/components/form/FieldErrorMessage';
import { UpdateProfileSubmitButton } from './UpdateProfileSubmitButton';
import { UserWithStatsDto } from '@/model/user/dto/user-with-stats.dto';
import { useUserProfile } from '@/model/user/users';
import { UpdateUserRequestDto } from '@/model/user/dto/update-user-request.dto';
import { isResponseOk } from '@/model/api';
import { toast } from 'react-hot-toast';

interface PeriodCloseDialogProps {
  onClose(): void;
  user: UserWithStatsDto;
}

const validate = (
  values: Record<string, string>
): ValidationErrors | Promise<ValidationErrors> => {
  const errors: ValidationErrors = {};

  // username validation
  if (values.username) {
    if (values.username.length < 2) {
      errors.username = 'Min 2 characters';
    } else if (values.username.length > 32) {
      errors.username = 'Max 32 characters';
    } else {
      const pattern = /^[a-z0-9][a-z0-9_.-]{0,30}[a-z0-9]$/;
      if (!pattern.test(values.username)) {
        errors.username =
          'Usernames can only contain lowercase letters, numbers, dots, dashes and underscores';
      }
    }
  } else {
    errors.username = 'Required';
  }

  // rewardsEthAddress validation
  if (values.rewardsEthAddress) {
    if (values.rewardsEthAddress.length !== 42) {
      errors.rewardsEthAddress =
        'Enter a valid ETH address, 42 characters. ENS names are not supported yet.';
    }
  } else {
    errors.rewardsEthAddress = 'Required';
  }

  return errors as ValidationErrors;
};

export const EditProfileDialog = ({
  onClose,
  user,
}: PeriodCloseDialogProps): JSX.Element => {
  const { update } = useUserProfile();

  const handleSaveUserProfile = async (
    values: UpdateUserRequestDto
  ): Promise<void> => {
    const { username, rewardsEthAddress } = values;
    const response = await update(user._id, username, rewardsEthAddress);

    if (isResponseOk(response)) {
      toast.success('User profile saved');
    } else {
      toast.error('Profile update failed');
    }

    onClose();
  };

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
            <Form
              onSubmit={handleSaveUserProfile}
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
                            Change to receive rewards to a different eth address
                            than the identity address
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
