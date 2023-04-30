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
        <table className="mx-5 table-auto">
          {Object.keys(report.rows[0]).map((key) => (
            <tr key={key}>
              <td className="pr-5">{key}</td>
              <td>{report.rows[0][key]}</td>
            </tr>
          ))}
        </table>
      )}
      {report.rows.length > 1 && <ReportsTable data={report.rows} />}
    </div>
  );
};
