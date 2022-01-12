import { AllPeriods, Period } from "@/model/periods";
import { formatDate } from "@/utils/date";
import { classNames } from "@/utils/index";
import React, { SyntheticEvent } from "react";
import { useHistory } from "react-router-dom";
import { TableOptions, useTable } from "react-table";
import { useRecoilValue } from "recoil";

const PeriodsTable = () => {
  const allPeriods = useRecoilValue(AllPeriods);
  const history = useHistory();

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
      {
        Header: "",
        accessor: "status",
        Cell: (data: any) => {
          return (
            <div
              className={classNames(
                data.value === "OPEN"
                  ? "bg-green-400"
                  : data.value === "QUANTIFY"
                  ? "bg-pink-400"
                  : "bg-gray-300",
                "inline-block px-2 py-1 text-xs text-white bg-black rounded-full"
              )}
            >
              {data.value}
            </div>
          );
        },
      },
    ],
    []
  );

  const options = {
    columns,
    data: allPeriods ? allPeriods : [],
  } as TableOptions<{}>;
  const tableInstance = useTable(options);

  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } =
    tableInstance;

  if (!Array.isArray(allPeriods) || allPeriods.length === 0)
    return <div>Create your first period to get started quantifying.</div>;

  const handleClick = (periodId: string) => (e: SyntheticEvent) => {
    history.push(`/period/${periodId}`);
  };
  return (
    <table
      id="periods-table"
      className="w-full table-auto"
      {...getTableProps()}
    >
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
            <tr
              className={classNames(
                row.values.status === "CLOSED" ? "text-gray-400" : "",
                "cursor-pointer hover:bg-gray-100"
              )}
              id={"period-" + row.values.name}
              {...row.getRowProps()}
              onClick={handleClick((row.original as Period)._id!)}
            >
              {row.cells.map((cell) => {
                return <td {...cell.getCellProps()}>{cell.render("Cell")}</td>;
              })}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};

export default PeriodsTable;
