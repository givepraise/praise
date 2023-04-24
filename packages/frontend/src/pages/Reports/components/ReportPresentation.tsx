import { useReportRunReturn } from '../../../model/report/types/use-report-run-return.type';
import { DefaultTable } from './presentations/DefaultTable';

const WhichPresentation = ({
  report,
}: {
  report: useReportRunReturn;
}): JSX.Element => {
  switch (report.manifest.name) {
    case 'top-praise':
      return <DefaultTable report={report} />;
    default:
      return <DefaultTable report={report} />;
  }
};

export const ReportPresentation = ({
  report,
}: {
  report: useReportRunReturn;
}): JSX.Element => {
  return (
    <div>
      <h1 className="text-4xl font-bold">Report Presentation</h1>
      <WhichPresentation report={report} />
    </div>
  );
};
