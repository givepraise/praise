import {
  Period,
  PeriodReceivers,
  usePeriodPraisesQuery,
} from "@/model/periods";
import React, { SyntheticEvent } from "react";
import { useHistory, useParams } from "react-router-dom";
import { TableOptions, useTable } from "react-table";
import { useRecoilValue } from "recoil";

const ReceiverTable = () => {
  const history = useHistory();
  let { id } = useParams() as any;
  usePeriodPraisesQuery(id);
  const periodReceivers = useRecoilValue(PeriodReceivers({ periodId: id }));

  const columns = React.useMemo(
    () => [
      {
        Header: "Receiver",
        accessor: "username",
      },
      {
        Header: "Number of praise",
        accessor: "praiseCount",
      },
      {
        Header: "Total praise score",
        accessor: "praiseScore",
      },
    ],
    []
  );

  const options = {
    columns,
    data: periodReceivers ? periodReceivers : [],
  } as TableOptions<{}>;
  const tableInstance = useTable(options);

  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } =
    tableInstance;

  const handleClick = (periodId: string) => (e: SyntheticEvent) => {
    history.push(`/quantify/period/1/user/2`);
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
              className="cursor-pointer hover:bg-gray-100"
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

export default ReceiverTable;
