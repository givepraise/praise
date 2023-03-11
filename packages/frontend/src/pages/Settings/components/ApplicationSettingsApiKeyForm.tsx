// import { useRecoilValue } from 'recoil';
// import { ApiKeysListQuery } from '@/model/apikeys/apikeys';
import { faKey, faTimes, faCheck } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Dialog } from '@headlessui/react';
import { Button } from '@/components/ui/Button';
import { Form, Field } from 'react-final-form';
// import { useState } from 'react';

type ApplicationSettingsApiKeyFormProps = {
  open: boolean;
  close: () => void;
};

interface FormData {
  name: string;
  option: string;
}

const ApplicationSettingsApiKeyForm = ({
  open,
  close,
}: ApplicationSettingsApiKeyFormProps): JSX.Element => {
  const onSubmit = (values: FormData) => {
    console.log(values);
    return Promise.resolve();
  };
  return (
    <>
      <Dialog
        open={open}
        onClose={close}
        className="fixed inset-0 z-10 overflow-y-auto"
      >
        <div className="flex items-center justify-center min-h-screen">
          <Dialog.Overlay className="fixed inset-0 bg-black/30" />
          <div className="relative max-w-xl pb-16 mx-auto bg-white rounded dark:bg-slate-600 dark:text-white">
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
              <Dialog.Description className="text-center mb-7">
                <Form
                  onSubmit={onSubmit}
                  render={({ handleSubmit }): JSX.Element => {
                    return (
                      <>
                        <form onSubmit={handleSubmit} className="leading-loose">
                          <div className="mt-4">
                            <div>
                              <label htmlFor="name">Name</label>
                              <Field<string>
                                name="name"
                                component="input"
                                type="text"
                              />
                            </div>
                            <div>
                              <label htmlFor="option">Option</label>
                              <label>
                                <Field<string>
                                  name="option"
                                  component="input"
                                  type="radio"
                                  value="option1"
                                />{' '}
                                Option 1
                              </label>
                              <label>
                                <Field<string>
                                  name="option"
                                  component="input"
                                  type="radio"
                                  value="option2"
                                />{' '}
                                Option 2
                              </label>
                            </div>
                            <div className="flex justify-center">
                              <Button
                                className="mt-4 bg-red-600"
                                onClick={(): void => {
                                  close();
                                }}
                              >
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
              </Dialog.Description>
              <div className="flex justify-center"></div>
            </div>
          </div>
        </div>
      </Dialog>
    </>
  );
};

export default ApplicationSettingsApiKeyForm;
