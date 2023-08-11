import {
  faCogs,
  faFileDownload,
  faTimes,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Dialog } from '@headlessui/react';
import React from 'react';
import { Button } from '@/components/ui/Button';
import { makeClient } from '../../../utils/axios';
import { ReportManifestDto } from '../../../model/report/dto/report-manifest.dto';
import { isResponseAxiosError } from '../../../model/api';
import { recoilPersist } from 'recoil-persist';
import { atom, useRecoilState } from 'recoil';

const { persistAtom } = recoilPersist();

export const CustomReportUrl = atom<string>({
  key: 'CustomReportUrl',
  default: undefined,
  effects: [persistAtom],
});

interface CustomReportDialogProps {
  onClose(): void;
  onRun(url: string, manifest: ReportManifestDto): void;
}

export const CustomReportDialog = ({
  onClose,
  onRun,
}: CustomReportDialogProps): JSX.Element => {
  // Local state
  const [error, setError] = React.useState('');

  // Global state
  const [url, setUrl] = useRecoilState(CustomReportUrl);

  const handleUrlChange = (event): void => {
    setUrl(event.target.value);
  };

  const onButtonClick = async (): Promise<void> => {
    setError('');
    const client = makeClient();
    const response = await client.get<ReportManifestDto>(url);
    if (isResponseAxiosError(response)) {
      setError(
        `Unabe to load report. ${response.response?.status || ''} ${
          response.response?.statusText || ''
        } `
      );
      return;
    }
    if (!response.data || !response.data.configuration || !response.data.name) {
      setError('Invalid report manifest.');
      return;
    }
    onRun(url, response.data);
    onClose();
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <Dialog.Overlay className="fixed inset-0 bg-black/30" />
      <div className="relative max-w-xl pb-16 mx-auto bg-white rounded w-[600px] dark:bg-slate-600 dark:text-white">
        <div className="flex justify-end p-6">
          <Button variant="round" onClick={onClose}>
            <FontAwesomeIcon icon={faTimes} size="1x" />
          </Button>
        </div>
        <div className="px-20">
          <div className="flex justify-center mb-7">
            <FontAwesomeIcon icon={faCogs} size="2x" />
          </div>
          <Dialog.Title className="mb-12 text-center">
            Run Custom Report
          </Dialog.Title>

          <div className="mb-7">
            You can run custom reports by providing a full manifest url. The{' '}
            <code>report.js</code> is assumed to be located in the same
            directory as the manifest file. The easiest way to get started
            creating custom reports is to fork the{' '}
            <a
              href="https://github.com/givepraise/reports"
              target="_blank"
              rel="noreferrer"
            >
              Praise reports repository
            </a>
            .
          </div>
          <div className="mb-7">
            <label htmlFor="reportUrl">Full report manifest url</label>
            <input
              type="text"
              id="reportUrl"
              name="reportUrl"
              autoComplete="off"
              className="block w-full mt-2"
              value={url}
              placeholder="https://raw.githubusercontent.com/.../manifest.json"
              onChange={handleUrlChange}
            />
            {error && <div className="mt-2 text-sm text-red-500">{error}</div>}
          </div>

          <div className="flex justify-center">
            <Button onClick={(): void => void onButtonClick()}>
              <FontAwesomeIcon
                className="mr-2"
                icon={faFileDownload}
                size="1x"
              />
              Load report
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
