import { faTableList } from '@fortawesome/free-solid-svg-icons';
import { BreadCrumb } from '../../components/ui/BreadCrumb';
import { Page } from '../../components/ui/Page';
import React from 'react';
import { useReport } from '../../model/report/hooks/use-report.hook';
import { useReportRunReturn } from '../../model/report/types/use-report-run-return.type';
import { LoadScreen } from '../../components/ui/LoadScreen';
import { toObject } from '../../utils/string';
import { qsToObject } from '../../utils/querystring';
import { ReportPresentation } from './components/ReportPresentation';
import RevealMore from './components/RevealMore';
import CopyToClipboard from './components/CopyToClipboard';
import DownloadToFile from './components/DownloadToFile';
import { Parser } from '@json2csv/plainjs';
import { BackLink } from '../../navigation/BackLink';

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
    manifestUrl: `${qs.get('manifestUrl')}`,
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
        console.error(error);
      });
  }, [response, report, qs]);

  if (!response?.rows) return <LoadScreen />;

  const json = JSON.stringify(response.rows);
  const parser = new Parser();
  const csv = parser.parse(response.rows);

  return (
    <Page variant="full">
      <BreadCrumb name="Reports" icon={faTableList} />
      <BackLink />

      <div className="w-full p-5 mb-5 border rounded-none shadow-none md:shadow-md md:rounded-xl bg-warm-gray-50 dark:bg-slate-600 break-inside-avoid-column">
        <div className="flex flex-row items-center justify-between w-full">
          <div className="flex flex-col w-full">
            <h2>{response.manifest.displayName}</h2>
            <div>Version: {response.manifest.version}</div>
            <div>Author: {response.manifest.author}</div>
            <div>License: {response.manifest.license}</div>
          </div>
          <div className="top-0 grid grid-cols-4 gap-1 auto-cols-max">
            <div className="col-span-2 p-1">JSON:</div>
            <DownloadToFile
              text={json}
              filename={`${response.manifest.name}.json`}
            />
            <CopyToClipboard text={json} />
            <div className="col-span-2 p-1">CSV:</div>
            <DownloadToFile
              text={csv}
              filename={`${response.manifest.name}.csv`}
            />
            <CopyToClipboard text={csv} />
          </div>
        </div>
        <div className="p-3 mt-5 bg-black bg-opacity-5">
          <RevealMore content={response.log} maxHeight="300" />
        </div>
      </div>

      <div className="w-full px-0 py-5 mb-5 text-sm border rounded-none shadow-none md:shadow-md md:rounded-xl bg-warm-gray-50 dark:bg-slate-600">
        <ReportPresentation report={response} />
      </div>
    </Page>
  );
};

export default ReportsRunPage;
