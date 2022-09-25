import { faFileDownload, faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Dialog } from '@headlessui/react';
import { useRecoilValue } from 'recoil';
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { SingleSetting } from '@/model/settings';

interface PeriodCloseDialogProps {
  title: string;
  onClose(): void;
  onExport(exportContext): void;
}

export const PeriodCustomExportDialog = ({
  title,
  onClose,
  onExport,
}: PeriodCloseDialogProps): JSX.Element => {
  const customExportContextSettings = useRecoilValue(
    SingleSetting('CUSTOM_EXPORT_CONTEXT')
  );
  const context = customExportContextSettings
    ? (customExportContextSettings.valueRealized as string)
    : '';

  const csSupportPercentage = useRecoilValue(
    SingleSetting('CS_SUPPORT_PERCENTAGE')
  );

  const [exportContext, setExportContext] = React.useState(
    customExportContextSettings?.valueRealized
  );

  const handleExportContextChange = (event): void => {
    setExportContext(event.target.value);
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <Dialog.Overlay className="fixed inset-0 bg-black/30" />
      <div className="relative max-w-xl pb-16 mx-auto bg-white rounded dark:bg-slate-600 dark:text-white">
        <div className="flex justify-end p-6">
          <Button variant="round" onClick={onClose}>
            <FontAwesomeIcon icon={faTimes} size="1x" />
          </Button>
        </div>
        <div className="px-20">
          <div className="flex justify-center mb-7">
            <FontAwesomeIcon icon={faFileDownload} size="2x" />
          </div>
          <Dialog.Title className="mb-12 text-center">{title}</Dialog.Title>

          <div className="mb-7">
            <label htmlFor="distributionParameters">
              Distribution parameters
            </label>
            <textarea
              id="exportContext"
              name="distributionParameters"
              autoComplete="off"
              className="block w-full h-32 mt-2 resize-y"
              rows={4}
              defaultValue={context}
              onChange={handleExportContextChange}
            />
          </div>
          {csSupportPercentage?.valueRealized &&
          csSupportPercentage.valueRealized > 0 ? (
            <p className="mb-7">
              Thank you for supporting the continued development of Praise!{' '}
              <b>{csSupportPercentage?.valueRealized}%</b> will be added to the
              token distribution.{' '}
              <Link to={'/settings/custom-export'}>Change settings</Link>
            </p>
          ) : (
            <p className="mb-7">
              Support the development of Praise, consider donating a percentage
              of the distribution to the development team.{' '}
              <Link to={'/settings/custom-export'}>Change settings</Link>
            </p>
          )}

          <div className="flex justify-center">
            <Button
              onClick={(): void => {
                onExport(exportContext);
                onClose();
              }}
            >
              <FontAwesomeIcon
                className="mr-2"
                icon={faFileDownload}
                size="1x"
              />
              Export
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
