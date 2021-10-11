import { AllPeriodsQuery } from "@/store/periods";
import { formatDate } from "@/utils/date";
import React from "react";
import { TableOptions, useTable } from "react-table";
import { useRecoilValue } from "recoil";

const PeriodsTable = () => {
  const allPeriods = useRecoilValue(AllPeriodsQuery({}));

  const columns = React.useMemo(
    () => [
      {
        Header: "Period",
        accessor: "name",
      },
      {
        Header: "End date",
        accessor: "endDate",
        Cell: (data: any) => {
          return formatDate(data.value);
        },
      },
    ],
    []
  );

  const options = { columns, data: allPeriods } as TableOptions<{}>;
  const tableInstance = useTable(options);

  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } =
    tableInstance;

  if (!allPeriods) return <div>Unable to fetch user list.</div>;

  return (
    <table className="w-full" {...getTableProps()}>
      <thead>
        {headerGroups.map((headerGroup) => (
          <tr {...headerGroup.getHeaderGroupProps()}>
            {headerGroup.headers.map((column) => (
              <th className="text-left" {...column.getHeaderProps()}>
                {column.render("Header")}
              </th>
            ))}
          </tr>
        ))}
      </thead>
      <tbody {...getTableBodyProps()}>
        {rows.map((row) => {
          prepareRow(row);
          return (
            <tr {...row.getRowProps()}>
              {row.cells.map((cell) => {
                return <td {...cell.getCellProps()}>{cell.render("Cell")}</td>;
              })}
              <td>open</td>
              <td>&gt;</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};

export default PeriodsTable;
