import { faFileDownload, faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Dialog } from '@headlessui/react';
import { useRecoilValue } from 'recoil';
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { SingleSetting } from '@/model/settings/settings';
import toast from 'react-hot-toast';

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
  // Get custom export context setting, the default report config values
  const customExportContextSetting = useRecoilValue(
    SingleSetting('CUSTOM_EXPORT_CONTEXT')
  );

  // Store local changes to the export context
  const [customExportContext, setCustomExportContext] =
    React.useState<string>();

  // Update local state when changes are made to the textarea
  const handleExportContextChange = (event): void => {
    setCustomExportContext(event.target.value);
  };

  // Set local state when default export context has been loaded
  React.useEffect(() => {
    if (!customExportContextSetting) return;
    setCustomExportContext(
      JSON.stringify(customExportContextSetting.valueRealized, null, 2)
    );
  }, [customExportContextSetting]);

  // How much of the distribution should go to the development team
  const csSupportPercentage = useRecoilValue(
    SingleSetting('CS_SUPPORT_PERCENTAGE')
  );

  const onButtonClick = (): void => {
    if (!customExportContext) return;
    try {
      const config = JSON.parse(customExportContext);
      onExport(config);
      onClose();
    } catch (error) {
      toast.error((error as Error).message);
      return;
    }
  };

  if (!customExportContext || !csSupportPercentage) return <></>;

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
              value={customExportContext}
              onChange={handleExportContextChange}
            />
          </div>
          {csSupportPercentage?.valueRealized &&
          (csSupportPercentage.valueRealized as number) > 0 ? (
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
            <Button onClick={onButtonClick}>
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
