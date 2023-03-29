/* eslint-disable @typescript-eslint/no-misused-promises */
import { faCopy, faKey, faTimes } from '@fortawesome/free-solid-svg-icons';
import { Dialog } from '@headlessui/react';
import { Button } from '@/components/ui/Button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { CreateApiKeyResponseDto } from '@/model/apikeys/dto/create-api-key-input.dto';
import { toast } from 'react-hot-toast';

type ApplicationSettingsApiKeyPrevieProps = {
  open: boolean;
  apiKeyData: CreateApiKeyResponseDto | undefined;
  close: () => void;
};

const ApplicationSettingsApiKeyPreview = ({
  open,
  apiKeyData,
  close,
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
              <Dialog.Description className="text-center mb-7">
                Copy the API key and save it to a safe place, the key is only
                displayed once.
              </Dialog.Description>
              <div className="mb-2">
                <div className="mb-6">
                  <label className="block mb-2 text-lg font-bold">
                    API Key
                  </label>
                  <div className="flex items-center">
                    <input
                      type="text"
                      id="input-apikey"
                      value={apiKeyData?.key ?? ''}
                      readOnly
                      autoComplete="off"
                      placeholder="API Key"
                      className="block w-full mr-2"
                    />
                    <button
                      type="button"
                      onClick={async (): Promise<void> => {
                        await navigator.clipboard.writeText(
                          apiKeyData?.key ?? ''
                        );
                        toast.success('API Key copied to clipboard');
                      }}
                      className="px-3 py-2 rounded bg-none hover:none"
                    >
                      <FontAwesomeIcon
                        icon={faCopy}
                        className="w-5 h-5 text-gray-500"
                      />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Dialog>
    </>
  );
};

export default ApplicationSettingsApiKeyPreview;
