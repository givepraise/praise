/* eslint-disable @typescript-eslint/no-misused-promises */
import { faKey, faTimes, faCheck } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Dialog } from '@headlessui/react';
import { Button } from '@/components/ui/Button';
import { Form } from 'react-final-form';
import { StringInput } from '@/components/form/StringInput';
import { RadioInput } from '@/components/form/RadioInput';
import { CreateApiKeyInputDto } from '@/model/apikeys/dto/create-api-key-input.dto';

type ApplicationSettingsApiKeyFormProps = {
  open: boolean;
  close: () => void;
  onsubmit: (data: CreateApiKeyInputDto) => void;
};

interface FormData {
  description: string;
  role: 'API_KEY_READWRITE' | 'API_KEY_READ';
}

const ApplicationSettingsApiKeyForm = ({
  open,
  close,
  onsubmit,
}: ApplicationSettingsApiKeyFormProps): JSX.Element => {
  let errorDescription = '';

  const onSubmit = (values: FormData): void => {
    if (!values.description) {
      errorDescription = 'Label is required';
    } else {
      onsubmit({ description: values.description, role: values.role });
    }
  };
  return (
    <>
      <Dialog
        open={open}
        onClose={close}
        className="fixed inset-0 z-10 overflow-y-auto"
        style={{ maxWidth: '80%', margin: '0 auto' }}
      >
        <div className="flex items-center justify-center min-h-screen">
          <Dialog.Overlay className="fixed inset-0 bg-black/30" />
          <div className="relative w-2/4 pb-16 mx-auto bg-white rounded dark:bg-slate-600 dark:text-white">
            <div className="flex justify-end p-6">
              <Button variant="round" onClick={close}>
                <FontAwesomeIcon icon={faTimes} size="1x" />
              </Button>
            </div>
            <div className="px-20">
              <div className="flex justify-center mb-7">
                <FontAwesomeIcon icon={faKey} size="2x" />
              </div>
              <Dialog.Title className="text-center mb-7">
                Add API Key
              </Dialog.Title>
              <div className="mb-2 space-y-4">
                <Form
                  onSubmit={onSubmit}
                  encType="multipart/form-data"
                  initialValues={{ option: 'API_KEY_READ' }}
                  render={({ handleSubmit }): JSX.Element => {
                    return (
                      <>
                        <form onSubmit={handleSubmit} className="leading-loose">
                          <div className="mt-4">
                            <div>
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
                              <RadioInput
                                name="role"
                                apiResponse={null}
                                values={['Read', 'Read/Write']}
                                dbValue={'API_KEY_READ'}
                              />
                            </div>
                            <div className="flex justify-center">
                              <Button className="mt-4 bg-red-600" type="submit">
                                <FontAwesomeIcon
                                  className="mr-2"
                                  icon={faCheck}
                                  size="1x"
                                />
                                Save
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
      </Dialog>
    </>
  );
};

export default ApplicationSettingsApiKeyForm;
