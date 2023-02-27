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
import { SingleSetting } from '@/model/settings/settings';
import { ReportManifest } from '@/model/report/types/report-manifest.type';
import { UsePeriodReportReturn } from '@/model/report/types/use-period-report-return.type';

const defaultExportOptions = [
  { value: '', label: 'Export', disabled: true },
  {
    value: 'export-summary',
    label: 'Export (summary)',
  },
];

export const ExportSelect = (): JSX.Element | null => {
  // Period details
  const { periodId } = useParams<PeriodPageParams>();
  const allPeriods = useRecoilValue(AllPeriods);
  useLoadSinglePeriodDetails(periodId); // Fetch additional period details
  const period = useRecoilValue(SinglePeriod(periodId));

  // Load summary report
  const summaryReport = usePeriodReport({
    periodId,
    url: 'https://raw.githubusercontent.com/givepraise/reports/main/reports/period-receiver-summary/report.js',
  });

  // Report Log Dialog
  const [isReportLogDialogOpen, setIsReportLogDialogOpen] =
    React.useState(false);
  const [reportLog, setReportLog] = React.useState<string>('');

  // Get custom export src setting
  const customExportSrcSetting = useRecoilValue(
    SingleSetting('CUSTOM_EXPORT_MAP')
  );

  // Get custom export src setting
  const customExportFormatSetting = useRecoilValue(
    SingleSetting('CUSTOM_EXPORT_FORMAT')
  );

  // How much of the distribution should go to the development team
  const csSupportPercentage = useRecoilValue(
    SingleSetting('CS_SUPPORT_PERCENTAGE')
  );

  // Load custom report
  const customReport = usePeriodReport({
    periodId,
    url: customExportSrcSetting?.value,
  });

  // Store manifest of custom report if any
  const [manifest, setManifest] = React.useState<ReportManifest | undefined>(
    undefined
  );

  // Load manifest of custom report if any
  React.useEffect(() => {
    if (!customReport.ready || manifest) return;
    const getManifest = async (): Promise<void> => {
      const manifest = await customReport.manifest();
      setManifest(manifest);
    };
    void getManifest();
  }, [customReport, manifest]);

  // Store export choices in state
  const [exportOptions, setExportOptions] =
    React.useState<SelectInputOption[]>(defaultExportOptions);

  // Add custom export option if custom report is ready
  React.useEffect(() => {
    if (manifest) {
      setExportOptions([
        ...defaultExportOptions,
        {
          value: 'export-custom',
          label: `Export (${manifest.displayName})`,
        },
      ]);
    }
  }, [manifest]);

  // Open/close custom export dialog
  const [isCustomExportDialogOpen, setIsCustomExportDialogOpen] =
    React.useState(false);

  if (!period || !allPeriods) return null;

  /**
   * Run report, generate csv file. If config is provided, the report will be
   * run with the provided config. If config is not provided, the report will
   * be run with the default config.
   */
  const runReport = (
    report: UsePeriodReportReturn,
    format: 'csv' | 'json',
    config?: Record<string, unknown>
  ): void => {
    const toastId = 'report-toast';
    void toast.promise(
      report.run({ format, config }),
      {
        loading: 'Exporting …',
        success: (response) => {
          if (response) {
            let fileData = new Blob();
            if (format === 'json') {
              fileData = new Blob([JSON.stringify(response.rows, null, 2)]);
            } else if (response.csv) {
              fileData = new Blob([response.csv]);
            }
            saveLocalFile(fileData, `${response.manifest?.name}.${format}`);
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

  const handleSelectChange = (option: SelectInputOption): void => {
    if (option.value === 'export-summary') {
      void runReport(summaryReport, 'csv');
    } else if (option.value === 'export-custom') {
      setIsCustomExportDialogOpen(true);
    }
  };

  return (
    <>
      <div className="w-3/12">
        <SelectInput
          handleChange={handleSelectChange}
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
            onExport={(config): void =>
              runReport(
                customReport,
                customExportFormatSetting?.value === 'json' ? 'json' : 'csv',
                {
                  ...config,
                  devSupportPercentage: csSupportPercentage?.valueRealized,
                }
              )
            }
          />
        </div>
      </Dialog>
    </>
  );
};
