/* eslint-disable @typescript-eslint/no-misused-promises */
import {
  faSpinner,
  faKey,
  faTimes,
  faCheck,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Dialog } from '@headlessui/react';
import { Button } from '@/components/ui/Button';
import { Form } from 'react-final-form';
import { StringInput } from '@/components/form/StringInput';
import { RadioInputKeys } from '@/components/form/RadioInputKeys';
import { CreateApiKeyInputDto } from '@/model/apikeys/dto/create-api-key-input.dto';
import { SubmissionErrors } from 'final-form';

type ApplicationSettingsApiKeyFormProps = {
  open: boolean;
  close: () => void;
  onsubmit: (data: CreateApiKeyInputDto) => Promise<SubmissionErrors>;
  loading: boolean;
};

interface FormData {
  description: string;
  role: 'API_KEY_READWRITE' | 'API_KEY_READ';
}

const ApplicationSettingsApiKeyForm = ({
  open,
  close,
  onsubmit,
  loading,
}: ApplicationSettingsApiKeyFormProps): JSX.Element => {
  let errorDescription = '';

  const onSubmit = async (values: FormData): Promise<SubmissionErrors> => {
    if (!values.description) {
      errorDescription = 'Label is required';
    } else {
      return onsubmit({ description: values.description, role: values.role });
    }
  };
  return (
    <>
      <Dialog
        open={open}
        onClose={close}
        className="fixed inset-0 z-10 overflow-y-auto"
      >
        <div>
          <div className="flex justify-center">
            <div className="flex items-center justify-center min-h-screen">
              <Dialog.Overlay className="fixed inset-0 bg-black/30" />
              <div className="relative max-w-xl pb-16 mx-auto bg-white rounded dark:bg-slate-600 dark:text-white">
                <div className="flex justify-end p-6">
                  <Button variant="round" onClick={close}>
                    <FontAwesomeIcon icon={faTimes} size="1x" />
                  </Button>
                </div>
                <div className="justify-center px-20">
                  <div className="flex justify-center mb-7">
                    <FontAwesomeIcon icon={faKey} size="2x" />
                  </div>
                  <Dialog.Title className="text-center mb-7">
                    Add API Key
                  </Dialog.Title>
                  <Dialog.Description className="text-center mb-7">
                    Please write your API key name and select your preferred
                    access level.
                  </Dialog.Description>
                  <Form
                    onSubmit={onSubmit}
                    encType="multipart/form-data"
                    initialValues={{ description: '', role: 'API_KEY_READ' }}
                    render={({ handleSubmit }): JSX.Element => {
                      return (
                        <>
                          <form
                            // eslint-disable-next-line @typescript-eslint/no-misused-promises
                            onSubmit={handleSubmit}
                            className="leading-loose"
                          >
                            <div className="mt-4">
                              <div className="mb-6">
                                <label className="block font-bold group">
                                  Label
                                </label>
                                <StringInput
                                  name="description"
                                  apiResponse={null}
                                />
                                {errorDescription && (
                                  <span className="text-red-500">
                                    {errorDescription}
                                  </span>
                                )}
                              </div>
                              <div>
                                <label className="block font-bold group">
                                  Access
                                </label>
                                <RadioInputKeys
                                  name="role"
                                  apiResponse={null}
                                  values={{
                                    API_KEY_READ: 'Read',
                                    API_KEY_READWRITE: 'Read/Write',
                                  }}
                                  dbValue={'API_KEY_READ'}
                                />
                              </div>
                              <div className="flex justify-center">
                                <Button
                                  className="mt-4 bg-red-600"
                                  type="submit"
                                  disabled={loading}
                                >
                                  <FontAwesomeIcon
                                    className="mr-2"
                                    icon={loading ? faSpinner : faCheck}
                                    size="1x"
                                  />
                                  {loading ? 'Saving' : 'Save'}
                                </Button>
                              </div>
                            </div>
                          </form>
                        </>
                      );
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </Dialog>
    </>
  );
};

export default ApplicationSettingsApiKeyForm;
