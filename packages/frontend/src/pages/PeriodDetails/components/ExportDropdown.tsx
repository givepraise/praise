import { SelectInput, SelectInputOption } from '@/components/form/SelectInput';
import {
  AllPeriods,
  PeriodPageParams,
  useLoadSinglePeriodDetails,
  SinglePeriod,
} from '@/model/periods/periods';
import { usePeriodReport } from '@/model/report/hooks/use-period-report.hook';
import { saveLocalFile } from '@/utils/file';
import { Dialog } from '@headlessui/react';
import React from 'react';
import toast from 'react-hot-toast';
import { useParams } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import { PeriodCustomExportDialog } from './CustomExportDialog';
import { ReportLogDialog } from './ReportLogDialog';

const exportOptions = [
  { value: '', label: 'Export', disabled: true },
  { value: 'export-full', label: 'Export (full)' },
  {
    value: 'export-summary',
    label: 'Export (summary)',
  },
];

export const ExportDropdown = (): JSX.Element | null => {
  // Period details
  const { periodId } = useParams<PeriodPageParams>();
  const allPeriods = useRecoilValue(AllPeriods);
  useLoadSinglePeriodDetails(periodId); // Fetch additional period details
  const period = useRecoilValue(SinglePeriod(periodId));

  // Report Log Dialog
  const [isReportLogDialogOpen, setIsReportLogDialogOpen] =
    React.useState(false);
  const [reportLog, setReportLog] = React.useState<string>('');

  // Custom Export Dialog
  const [isCustomExportDialogOpen, setIsCustomExportDialogOpen] =
    React.useState(false);

  const summaryReport = usePeriodReport({
    periodId,
    url: 'https://raw.githubusercontent.com/givepraise/reports/main/reports/period-receiver-summary/report.js',
  });

  if (!period || !allPeriods) return null;

  const handleExportSummary = (): void => {
    const toastId = 'exportToastSummary';
    void toast.promise(
      summaryReport.run({ format: 'csv' }),
      {
        loading: 'Exporting …',
        success: (response) => {
          if (response.csv) {
            const fileData = new Blob([response.csv]);
            saveLocalFile(fileData, 'praise-period-receiver-summary.csv');
            setReportLog(response.log);
            setIsReportLogDialogOpen(true);
            toast.remove(toastId);
            return 'Export completed';
          }
          return 'Empty export returned';
        },
        error: (msg: string) => {
          return `Export failed: ${msg}`;
        },
      },
      {
        id: toastId,
        position: 'top-center',
        loading: {
          duration: 2000,
        },
      }
    );
  };

  const handleExportCustom = (exportContext: string): void => {};

  const handleSelectExportChange = (option: SelectInputOption): void => {
    if (option.value === 'export-summary') {
      void handleExportSummary();
    } else if (option.value === 'export-custom') {
      setIsCustomExportDialogOpen(true);
    }
  };

  return (
    <>
      <div className="w-3/12">
        <SelectInput
          handleChange={handleSelectExportChange}
          options={exportOptions}
          selected={exportOptions[0]}
        />
      </div>

      <Dialog
        open={isReportLogDialogOpen}
        onClose={(): void => setIsReportLogDialogOpen(false)}
        className="fixed inset-0 z-10 overflow-y-auto"
      >
        <div>
          <ReportLogDialog
            onClose={(): void => setIsReportLogDialogOpen(false)}
            log={reportLog}
          />
        </div>
      </Dialog>

      <Dialog
        open={isCustomExportDialogOpen}
        onClose={(): void => setIsCustomExportDialogOpen(false)}
        className="fixed inset-0 z-10 overflow-y-auto"
      >
        <div>
          <PeriodCustomExportDialog
            title="Custom export"
            onClose={(): void => setIsCustomExportDialogOpen(false)}
            onExport={(exportContext): void =>
              handleExportCustom(exportContext)
            }
          />
        </div>
      </Dialog>
    </>
  );
};
