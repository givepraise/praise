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
import { CreateApiKeyResponseDto } from '@/model/apikeys/dto/create-api-key-input.dto';

type ApplicationSettingsApiKeyPrevieProps = {
  open: boolean;
  apiKeyData: CreateApiKeyResponseDto | null;
};

const ApplicationSettingsApiKeyPreview = ({
  open,
  apiKeyData,
}: ApplicationSettingsApiKeyPrevieProps): JSX.Element => {
  console.log({ open });
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
                API Key added
              </Dialog.Title>
              <div className="mb-2 space-y-4">
                <p>
                  Copy the API key and save it to a safe place, the key is only
                  displayed once.
                </p>
                {/* <StringInput
                  name="apikey"
                  apiResponse={null}
                  value={apiKeyData.hash ?? apiKeyData.hash}
                /> */}
                <input value={apiKeyData?.hash ?? ''} />
              </div>
            </div>
          </div>
        </div>
      </Dialog>
    </>
  );
};

export default ApplicationSettingsApiKeyPreview;
