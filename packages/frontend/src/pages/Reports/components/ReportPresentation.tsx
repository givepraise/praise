import { useReportRunReturn } from '../../../model/report/types/use-report-run-return.type';
import { DefaultPresentation } from '../presentations/DefaultPresentation';

const WhichPresentation = ({
  report,
}: {
  report: useReportRunReturn;
}): JSX.Element => {
  switch (report.manifest.name) {
    case 'top-praise':
      return <DefaultPresentation report={report} />;
    default:
      return <DefaultPresentation report={report} />;
  }
};

export const ReportPresentation = ({
  report,
}: {
  report: useReportRunReturn;
}): JSX.Element => {
  return (
    <div>
      <WhichPresentation report={report} />
    </div>
  );
};
