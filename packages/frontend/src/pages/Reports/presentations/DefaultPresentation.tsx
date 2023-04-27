import { useReportRunReturn } from '../../../model/report/types/use-report-run-return.type';
import { ReportsTable } from '../components/presentations/ReportsTable';

export const DefaultPresentation = ({
  report,
}: {
  report: useReportRunReturn;
}): JSX.Element => {
  return (
    <div>
      {report.rows.length === 1 && (
        <div className="flex flex-col items-center justify-center w-full">
          <div className="flex flex-col w-full px-3">
            {Object.keys(report.rows[0]).map((key) => (
              <div className="flex flex-row w-full px-3" key={key}>
                <div className="flex flex-col w-1/2 px-3">
                  <code>{key}</code>
                </div>
                <div className="flex flex-col w-1/2 px-3">
                  <code>{report.rows[0][key]}</code>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {report.rows.length > 1 && <ReportsTable data={report.rows} />}
    </div>
  );
};
