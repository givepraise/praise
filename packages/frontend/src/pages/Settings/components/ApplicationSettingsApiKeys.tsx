import { useRecoilValue } from 'recoil';
import { ApiKeysListQuery } from '@/model/apikeys/apikeys';
import { Button } from '@/components/ui/Button';
import { useState } from 'react';
import ApplicationSettingsApiKeyForm from './ApplicationSettingsApiKeyForm';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';

const ApplicationSettingsApiKeys = (): JSX.Element => {
  const [openApiKeyModal, setOpenApiKeyModal] = useState(false);
  const apiKeys = useRecoilValue(ApiKeysListQuery);

  const handleCloseApiKeyModal = (): void => {
    setOpenApiKeyModal(false);
  };

  return (
    <>
      <div className="mb-2">
        Generated keys to give external applicaitons access to the Praise API.
        For details on the permission levels, see documentation:
        <a
          href="https://givepraise.xyz/docs/category/configuring-praise"
          target="_blank"
          rel="noreferrer"
        >
          API Keys
        </a>
      </div>
      <div className="flex justify-between">
        <h3 className="text-lg font-bold">Keys</h3>
        <h3 className="text-lg font-bold">Access</h3>
      </div>
      <Button onClick={(): void => setOpenApiKeyModal(true)} className="mt-4">
        <FontAwesomeIcon icon={faPlus} size="1x" className="mr-2" />
        Add key
      </Button>
      <ApplicationSettingsApiKeyForm
        open={openApiKeyModal}
        close={handleCloseApiKeyModal}
      />
    </>
  );
};

export default ApplicationSettingsApiKeys;
