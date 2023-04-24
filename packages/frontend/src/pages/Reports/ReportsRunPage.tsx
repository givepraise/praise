import { faCalendarAlt } from '@fortawesome/free-solid-svg-icons';
import { BreadCrumb } from '../../components/ui/BreadCrumb';
import { Page } from '../../components/ui/Page';
import React from 'react';
import { useReport } from '../../model/report/hooks/use-report.hook';
import { useReportRunReturn } from '../../model/report/types/use-report-run-return.type';
import { LoadScreen } from '../../components/ui/LoadScreen';
import { toObject } from '../../utils/string';
import { qsToObject } from '../../utils/querystring';
import { ReportPresentation } from './components/ReportPresentation';

const ReportsRunPage = (): JSX.Element | null => {
  const qs = React.useMemo(
    () => new URLSearchParams(window.location.search),
    []
  );
  const [response, setResponse] = React.useState<useReportRunReturn | null>(
    null
  );

  // Load report engine - get database, start duckdb, etc
  const report = useReport({
    startDate: qs.get('startDate') || undefined,
    endDate: qs.get('endDate') || undefined,
    url: `https://raw.githubusercontent.com/givepraise/reports/main/reports/${qs.get(
      'report'
    )}/report.js`,
  });

  // Run report when report is loaded
  React.useEffect(() => {
    if (response || !report.ready) return;
    report
      .run({ format: 'json', config: qsToObject(qs) })
      .then((response) => {
        if (response) {
          response.rows = toObject(response.rows);
          setResponse(response);
        }
      })
      .catch((error) => {
        console.log(error);
      });
  }, [response, report, qs]);

  if (!response?.rows) return <LoadScreen />;
  return (
    <Page variant="full">
      <BreadCrumb name="Reports" icon={faCalendarAlt} />

      <div className="w-full px-0 py-5 mb-5 text-sm border rounded-none shadow-none md:shadow-md md:rounded-xl bg-warm-gray-50 dark:bg-slate-600 break-inside-avoid-column">
        <div className="flex flex-col w-full px-3">
          <code>
            {response.log.split('\n').map((row) => (
              <>
                {row}
                <br />
              </>
            ))}
          </code>
        </div>
      </div>

      <div className="w-full px-0 py-5 mb-5 text-sm border rounded-none shadow-none md:shadow-md md:rounded-xl bg-warm-gray-50 dark:bg-slate-600">
        <ReportPresentation report={response} />
      </div>
    </Page>
  );
};

export default ReportsRunPage;
