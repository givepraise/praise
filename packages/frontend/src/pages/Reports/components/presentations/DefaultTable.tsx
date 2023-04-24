import { useReportRunReturn } from '../../../../model/report/types/use-report-run-return.type';

export const DefaultTable = ({
  report,
}: {
  report: useReportRunReturn;
}): JSX.Element => {
  return (
    <div>
      <div className="flex flex-col items-center justify-center w-full">
        <h1 className="text-4xl font-bold">Default Table</h1>
        {report.rows.length === 1 && (
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
        )}
        {report.rows.length > 1 &&
          report.rows.map((row, index) => {
            return (
              <div className="flex flex-col w-full px-3" key={index}>
                {JSON.stringify(row)}
              </div>
            );
          })}
      </div>
    </div>
  );
};
