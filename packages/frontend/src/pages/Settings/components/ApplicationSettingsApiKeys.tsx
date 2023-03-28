import { useSetApiKey } from '@/model/apikeys/apikeys';
import { Button } from '@/components/ui/Button';
import { useState } from 'react';
import ApplicationSettingsApiKeyForm from './ApplicationSettingsApiKeyForm';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { CreateApiKeyInputDto } from '@/model/apikeys/dto/create-api-key-input.dto';
import { isApiResponseValidationError, isResponseOk } from '@/model/api';
import ApplicationSettingsApiKeyPreview from './ApplicationSettingsApiKeyPreview';
import { ApplicationSettingsApiKeyTable } from './ApplicationSettingsApiKeyTable';
import { toast } from 'react-hot-toast';
import { ApiErrorResponseData } from 'shared/interfaces/api-error-reponse-data.interface';
import { FORM_ERROR, SubmissionErrors } from 'final-form';

const ApplicationSettingsApiKeys = (): JSX.Element => {
  const [openApiKeyModal, setOpenApiKeyModal] = useState(false);
  const [openApiKeyModalPreview, setOpenApiKeyModalPreview] = useState(false);
  const [apiKeyData, setApiKeyData] = useState<CreateApiKeyInputDto>();
  const [loading, setLoading] = useState(false);

  const { setApiKey } = useSetApiKey();

  const handleCloseApiKeyModal = (): void => {
    setOpenApiKeyModal(false);
  };

  const handleCloseApiKeyModalPreview = (): void => {
    setOpenApiKeyModalPreview(false);
  };

  /**
   * Handle adding a new API key
   *
   * @param data
   */
  const handleAddApiKey = async (
    data: CreateApiKeyInputDto
  ): Promise<SubmissionErrors> => {
    setOpenApiKeyModal(false);
    setLoading(true);

    const response = await setApiKey(data);

    if (isResponseOk(response)) {
      toast.success('API Key created');
      setOpenApiKeyModalPreview(true);
      setApiKeyData(response.data);
      setLoading(false);
      return {};
    }

    setLoading(false);

    if (isApiResponseValidationError(response) && response.response) {
      return (response.response.data as ApiErrorResponseData).errors;
    }

    toast.error('Api Key create failed');
    return { [FORM_ERROR]: 'Api Key create failed' };
  };

  return (
    <>
      <div className="mb-2">
        Generated keys to give external applications access to the Praise API.
        For details on the permission levels, see documentation:{' '}
        <a
          href="https://givepraise.xyz/docs/category/configuring-praise"
          target="_blank"
          rel="noreferrer"
        >
          API Keys
        </a>
      </div>
      <ApplicationSettingsApiKeyTable />
      <Button onClick={(): void => setOpenApiKeyModal(true)} className="mt-4">
        <FontAwesomeIcon icon={faPlus} size="1x" className="mr-2" />
        Add key
      </Button>
      <ApplicationSettingsApiKeyForm
        open={openApiKeyModal}
        close={handleCloseApiKeyModal}
        onsubmit={handleAddApiKey}
        loading={loading}
      />
      {apiKeyData && openApiKeyModalPreview && (
        <ApplicationSettingsApiKeyPreview
          open={openApiKeyModalPreview}
          apiKeyData={apiKeyData}
          close={handleCloseApiKeyModalPreview}
        />
      )}
    </>
  );
};

export default ApplicationSettingsApiKeys;