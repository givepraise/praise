import { UserCell } from "@/components/table/UserCell";
import { PeriodQuantifiers, usePeriodPraisesQuery } from "@/model/periods";
import { useAllUsersQuery } from "@/model/users";
import React from "react";
import { useParams } from "react-router-dom";
import { TableOptions, useTable } from "react-table";
import { useRecoilValue } from "recoil";

const QuantifierTable = () => {
  let { periodId } = useParams() as any;
  usePeriodPraisesQuery(periodId);
  useAllUsersQuery();

  const periodQuantifiers = useRecoilValue(PeriodQuantifiers({ periodId }));

  const columns = React.useMemo(
    () => [
      {
        Header: "Quantifier",
        accessor: "userId",
        Cell: (data: any) => <UserCell userId={data.value} />,
      },
      {
        Header: "Finished items",
        accessor: "",
        Cell: (data: any) => {
          return data.row.original
            ? `${data.row.original.done} / ${data.row.original.count}`
            : null;
        },
      },
    ],
    []
  );

  const options = {
    columns,
    data: periodQuantifiers ? periodQuantifiers : [],
  } as TableOptions<{}>;
  const tableInstance = useTable(options);
  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } =
    tableInstance;

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
            <tr id={"period-" + row.values.name} {...row.getRowProps()}>
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

export default QuantifierTable;
