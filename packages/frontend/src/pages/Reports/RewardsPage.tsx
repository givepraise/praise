import { faCoins } from '@fortawesome/free-solid-svg-icons';
import { Dialog } from '@headlessui/react';
import React from 'react';
import { Link, useHistory } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import {
  DatePeriodRangeStartDate,
  DatePeriodRangeEndDate,
  DatePeriodRange,
} from '../../components/report/DatePeriodRange';
import { BreadCrumb } from '../../components/ui/BreadCrumb';
import { Page } from '../../components/ui/Page';
import { SingleReport } from '../../model/report/reports';
import { ReportConfigDialog } from './components/ReportConfigDialog';
import { ReportsTable } from './components/ReportsTable';
import { AllPeriods } from '../../model/periods/periods';
import * as check from 'wasm-check';
import toast from 'react-hot-toast';

const NoPeriodsMessage = (): JSX.Element | null => {
  const allPeriods = useRecoilValue(AllPeriods);
  if (allPeriods.length > 0) return null;
  return (
    <div className="w-full p-5 mb-5 border rounded-none shadow-none md:shadow-md md:rounded-xl bg-warm-gray-50 dark:bg-slate-600 break-inside-avoid-column">
      Rewards will be available once you have created your first{' '}
      <Link to="/periods">praise period</Link>.
    </div>
  );
};

const RewardsPage = (): JSX.Element | null => {
  const [isConfigDialogOpen, setIsConfigDialogOpen] = React.useState(false);
  const [selectedReportName, setSelectedReportName] = React.useState<string>();
  const allPeriods = useRecoilValue(AllPeriods);

  const startDate = useRecoilValue(DatePeriodRangeStartDate);
  const endDate = useRecoilValue(DatePeriodRangeEndDate);
  const report = useRecoilValue(SingleReport(selectedReportName));

  const history = useHistory();

  const handleReportClick = (name: string) => (): void => {
    if (allPeriods.length === 0) return;
    if (!check.support()) {
      toast.error(
        'Your browser does not support WebAssembly which is required to run reports. Please try a different browser.'
      );
      return;
    }
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
      <BreadCrumb name="Rewards" icon={faCoins} />

      <DatePeriodRange />

      <NoPeriodsMessage />

      <div className="w-full px-0 py-5 mb-5 text-sm border rounded-none shadow-none md:shadow-md md:rounded-xl bg-warm-gray-50 dark:bg-slate-600 break-inside-avoid-column">
        <ReportsTable onClick={handleReportClick} include={['rewards']} />
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

export default RewardsPage;
