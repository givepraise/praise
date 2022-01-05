import { UserCell } from "@/components/table/UserCell";
import { SinglePraise } from "@/model/praise";
import { formatDate } from "@/utils/date";
import React from "react";
import { useParams } from "react-router-dom";
import { TableOptions, useTable } from "react-table";
import { useRecoilValue } from "recoil";

const PraiseDetailTable = () => {
  let { praiseId } = useParams() as any;

  const data = useRecoilValue(SinglePraise({ praiseId }));

  const columns = React.useMemo(
    () => [
      {
        Header: "Quantifier",
        accessor: "quantifier",
        Cell: (data: any) => <UserCell userId={data.value} />,
      },
      {
        Header: "Date",
        accessor: "updatedAt",
        Cell: (data: any) => formatDate(data.value),
      },
      {
        Header: "Score",
        accessor: "score",
      },
      {
        Header: "Dismissed",
        accessor: "dismissed",
      },
      {
        Header: "Duplicate",
        accessor: "duplicate",
      },
    ],
    []
  );

  const options = {
    columns,
    data: data ? data.quantifications : [],
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

export default PraiseDetailTable;
