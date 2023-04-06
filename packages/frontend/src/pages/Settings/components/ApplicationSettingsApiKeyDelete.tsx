/* eslint-disable @typescript-eslint/no-misused-promises */
import { faBackspace, faKey, faTimes } from '@fortawesome/free-solid-svg-icons';
import { Dialog } from '@headlessui/react';
import { Button } from '@/components/ui/Button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { toast } from 'react-hot-toast';
import { SingleApiKey } from '@/model/apikeys/apikeys';
import { useRecoilValue } from 'recoil';

type ApiKeyDeleteProps = {
  open: boolean;
  deleteKeyID: string;
  close: () => void;
};

const ApplicationSettingsApiKeyDelete = ({
  open,
  deleteKeyID,
  close,
}: ApiKeyDeleteProps): JSX.Element => {
  const apiKey = useRecoilValue(SingleApiKey(deleteKeyID));

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
                Delete API Key
              </Dialog.Title>
              <Dialog.Description className="text-center mb-7">
                {apiKey?.hash.slice(0, 8)}
              </Dialog.Description>
              <div className="mb-2">
                <div className="flex justify-center">
                  <Button
                    type="button"
                    onClick={async (): Promise<void> => {
                      toast.success('API Key deleted');
                    }}
                    className="mt-4 bg-red-600"
                  >
                    <FontAwesomeIcon
                      icon={faBackspace}
                      className="mr-2 text-sm text-white"
                    />{' '}
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Dialog>
    </>
  );
};

export default ApplicationSettingsApiKeyDelete;
