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

  const getSupportPercentageText = (): JSX.Element => {
    return csSupportPercentage && csSupportPercentage.valueRealized > 0 ? (
      <p className="mt-4">
        We support Commons Stack in the continued development of Praise and will
        add <b>{csSupportPercentage?.valueRealized}%</b> to the token
        distribution.
      </p>
    ) : (
      <p>
        Consider supporting the development of Praise by donating a small amount
        of the distribution to the Praise dev team.{' '}
        <Link to={'/settings/custom-export'}>
          Settings: Custom token export
        </Link>
      </p>
    );
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
              className="block w-full mt-2 resize-y"
              rows={4}
              defaultValue={context}
              onChange={handleExportContextChange}
            />
          </div>
          {getSupportPercentageText()}
          {/* {!csSupportPercentage ||
            (csSupportPercentage.valueRealized > 0 && (
              <p className="mt-4">
                We support Commons Stack in the continued development of Praise
                and will add <b>{csSupportPercentage?.valueRealized}%</b> to the
                token distribution.
              </p>
            ))} */}

          <div className="flex justify-center">
            <Button
              className="mt-4 bg-black hover:bg-warm-gray-800"
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
