import { faTimes, faFileLines } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Dialog } from '@headlessui/react';
import { Button } from '@/components/ui/Button';

interface ReportLogDialogProps {
  log: string;
  onClose(): void;
}

export const ReportLogDialog = ({
  log,
  onClose,
}: ReportLogDialogProps): JSX.Element => {
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
            <FontAwesomeIcon icon={faFileLines} size="2x" />
          </div>
          <Dialog.Title className="mb-12 text-center">Export log</Dialog.Title>
          <div>
            <pre className="p-4 space-y-3 overflow-y-auto text-xs break-normal border rounded-lg max-h-64 dark:bg-slate-600 dark:text-white">
              {log}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
