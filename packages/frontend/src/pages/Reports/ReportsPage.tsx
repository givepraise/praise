import { faCalendarAlt } from '@fortawesome/free-solid-svg-icons';
import { Dialog } from '@headlessui/react';
import React from 'react';
import { useHistory } from 'react-router-dom';
import { atom, useRecoilValue } from 'recoil';
import {
  DatePeriodRangeStartDate,
  DatePeriodRangeEndDate,
  DatePeriodRange,
} from '../../components/DatePeriodRange';
import { BreadCrumb } from '../../components/ui/BreadCrumb';
import { Page } from '../../components/ui/Page';
import { SingleReport } from '../../model/report/reports';
import { ReportConfigDialog } from './components/ReportConfigDialog';
import { ReportsTable } from './components/ReportsTable';

export const SelectedReportName = atom<string | null>({
  key: 'SelectedReportName',
  default: null,
});

const ReportsPage = (): JSX.Element | null => {
  const [isConfigDialogOpen, setIsConfigDialogOpen] = React.useState(false);
  const [selectedReportName, setSelectedReportName] = React.useState<string>();

  const startDate = useRecoilValue(DatePeriodRangeStartDate);
  const endDate = useRecoilValue(DatePeriodRangeEndDate);
  const report = useRecoilValue(SingleReport(selectedReportName));

  const history = useHistory();

  const handleReportClick = (name: string) => (): void => {
    setSelectedReportName(name);
  };

  const runReport = React.useCallback(
    (name: string, config: Record<string, string>) => {
      if (!startDate || !endDate) return;
      const qs = new URLSearchParams({
        report: name,
        ...config,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      });
      history.push(`/reports/run?${qs.toString()}`);
    },
    [startDate, endDate, history]
  );

  React.useEffect(() => {
    if (!selectedReportName || !report) return;
    if (report.configuration && Object.keys(report.configuration).length > 0) {
      setIsConfigDialogOpen(true);
      return;
    }
    runReport(selectedReportName, {});
  }, [endDate, history, selectedReportName, startDate, report, runReport]);

  return (
    <Page variant="full">
      <BreadCrumb name="Reports" icon={faCalendarAlt} />

      <DatePeriodRange />
      <div className="w-full px-0 py-5 mb-5 text-sm border rounded-none shadow-none md:shadow-md md:rounded-xl bg-warm-gray-50 dark:bg-slate-600 break-inside-avoid-column">
        <ReportsTable onClick={handleReportClick} />
      </div>

      <Dialog
        open={isConfigDialogOpen}
        onClose={(): void => setIsConfigDialogOpen(false)}
        className="fixed inset-0 z-10 overflow-y-auto"
      >
        <div>
          <ReportConfigDialog
            title="Report configuration"
            reportName={report?.name}
            onClose={(): void => {
              setSelectedReportName(undefined);
              setIsConfigDialogOpen(false);
            }}
            onRun={(config): void => {
              runReport(selectedReportName || '', config);
            }}
          />
        </div>
      </Dialog>
    </Page>
  );
};

export default ReportsPage;
