import { Dialog } from '@headlessui/react';
import React from 'react';
import { toast } from 'react-hot-toast';
import { useParams } from 'react-router-dom';
import { useRecoilValue } from 'recoil';

import {
  AllPeriods,
  PeriodPageParams,
  SinglePeriod,
  useExportPraise,
  useLoadSinglePeriodDetails,
} from '@/model/periods';
import { saveLocalFile } from '@/utils/file';

import { SelectInputOption, SelectInput } from '@/components/form/SelectInput';
import { SingleSetting } from '@/model/settings';
import { CustomExportTransformer } from '@/model/app';
import { PeriodCustomExportDialog } from './CustomExportDialog';

export const ExportDropdown = (): JSX.Element | null => {
  const [isCustomExportDialogOpen, setIsCustomExportDialogOpen] =
    React.useState(false);

  const allPeriods = useRecoilValue(AllPeriods);
  const { periodId } = useParams<PeriodPageParams>();
  useLoadSinglePeriodDetails(periodId); // Fetch additional period details
  const period = useRecoilValue(SinglePeriod(periodId));
  const { exportPraiseFull, exportPraiseSummary, exportPraiseCustom } =
    useExportPraise();
  const customExportFormat = useRecoilValue(
    SingleSetting('CUSTOM_EXPORT_FORMAT')
  );

  const customExportTransformer = useRecoilValue(CustomExportTransformer);

  const customExportDialogRef = React.useRef(null);

  if (!period || !allPeriods) return null;

  const exportOptions = [
    { value: '', label: 'Export', disabled: true },
    { value: 'export-full', label: 'Export (full)' },
    {
      value: 'export-summary',
      label: 'Export (summary)',
    },
  ];

  customExportTransformer &&
    exportOptions.push({
      value: 'export-custom',
      label: customExportTransformer.name,
    });

  const handleExportFull = (): void => {
    const toastId = 'exportToastFull';
    void toast.promise(
      exportPraiseFull(period),
      {
        loading: 'Exporting …',
        success: (exportData: Blob | undefined) => {
          if (exportData) {
            saveLocalFile(exportData, 'praise-period-export-full.csv');
            setTimeout(() => toast.remove(toastId), 2000);
            return 'Export done';
          }
          return 'Empty export returned';
        },
        error: 'Export failed',
      },
      {
        id: toastId,
        position: 'top-center',
        loading: {
          duration: 1000,
        },
      }
    );
  };

  const handleExportSummary = (): void => {
    const toastId = 'exportToastSummary';
    void toast.promise(
      exportPraiseSummary(period),
      {
        loading: 'Exporting …',
        success: (exportData: Blob | undefined) => {
          if (exportData) {
            saveLocalFile(exportData, 'praise-period-export-summary.csv');
            setTimeout(() => toast.remove(toastId), 2000);
            return 'Export done';
          }
          return 'Empty export returned';
        },
        error: 'Export failed',
      },
      {
        id: toastId,
        position: 'top-center',
        loading: {
          duration: 1000,
        },
      }
    );
  };

  const handleExportCustom = (exportContext: string): void => {
    const toastId = 'exportToastCustom';
    void toast.promise(
      exportPraiseCustom(period, exportContext),
      {
        loading: 'Distributing …',
        success: (data: Blob | undefined) => {
          if (data) {
            saveLocalFile(
              data,
              `praise-period-export-custom.${customExportFormat?.valueRealized}`
            );
            setTimeout(() => toast.remove(toastId), 2000);
            return 'Export done';
          }

          return 'Empty export returned';
        },
        error: (err) => {
          toast.error(err.message);
          return 'Export failed';
        },
      },
      {
        id: toastId,
        position: 'top-center',
        loading: {
          duration: 1000,
        },
      }
    );
  };

  const handleSelectExportChange = (option: SelectInputOption): void => {
    if (option.value === 'export-full') {
      handleExportFull();
    } else if (option.value === 'export-summary') {
      handleExportSummary();
    } else if (option.value === 'export-custom') {
      setIsCustomExportDialogOpen(true);
    }
  };

  if (!period) return <div>Period not found.</div>;

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
        open={isCustomExportDialogOpen}
        onClose={(): void => setIsCustomExportDialogOpen(false)}
        className="fixed inset-0 z-10 overflow-y-auto"
        initialFocus={customExportDialogRef}
      >
        <div ref={customExportDialogRef}>
          <PeriodCustomExportDialog
            title={customExportTransformer?.name || 'Custom export'}
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
