/* eslint-disable @typescript-eslint/no-misused-promises */
import { faBackspace, faKey, faTimes } from '@fortawesome/free-solid-svg-icons';
import { Dialog } from '@headlessui/react';
import { Button } from '@/components/ui/Button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { SingleApiKey } from '@/model/apikeys/apikeys';
import { useRecoilValue } from 'recoil';
import { SubmissionErrors } from 'final-form';

type ApiKeyDeleteProps = {
  open: boolean;
  deleteKeyID: string;
  close: () => void;
  deleteHandle: (id: string) => Promise<SubmissionErrors>;
};

const ApplicationSettingsApiKeyDelete = ({
  open,
  deleteKeyID,
  close,
  deleteHandle,
}: ApiKeyDeleteProps): JSX.Element => {
  const apiKey = useRecoilValue(SingleApiKey(deleteKeyID));

  const handleDelete = async (): Promise<SubmissionErrors> => {
    return await deleteHandle(deleteKeyID);
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
                Delete API Key
              </Dialog.Title>
              <Dialog.Description className="text-center mb-7">
                {apiKey?.hash.slice(-8)}
              </Dialog.Description>
              <div className="mb-2">
                <div className="flex justify-center">
                  <Button
                    type="button"
                    onClick={handleDelete}
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
