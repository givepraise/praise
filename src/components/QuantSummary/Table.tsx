import {
  AllPeriodReceiverPraise,
  QuantifierReceiverData,
} from "@/model/periods";
import { formatDate } from "@/utils/date";
import { faUserCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { SyntheticEvent } from "react";
import { useHistory, useParams } from "react-router-dom";
import { TableOptions, useTable } from "react-table";
import { useRecoilValue } from "recoil";

const PeriodReceiverTable = () => {
  const history = useHistory();
  let { periodId, receiverId } = useParams() as any;

  const data = useRecoilValue(
    AllPeriodReceiverPraise({ periodId, receiverId })
  );

  const columns = React.useMemo(
    () => [
      {
        Header: "From",
        accessor: "createdAt",
        Cell: (data: any) => {
          return (
            <div className="flex items-center w-full">
              <div className="flex items-center">
                <FontAwesomeIcon icon={faUserCircle} size="2x" />
              </div>
              <div className="flex-grow p-3 whitespace-nowrap">
                {formatDate(data.row.original.createdAt)}
                <br />
                {data.row.original.giver.username}
              </div>
            </div>
          );
        },
      },
      {
        Header: "Reason",
        accessor: "reason",
      },
      {
        Header: "Avg.score",
        accessor: "avgScore",
      },
    ],
    []
  );

  const options = {
    columns,
    data: data ? data : [],
  } as TableOptions<{}>;
  const tableInstance = useTable(options);

  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } =
    tableInstance;

  const handleClick = (data: QuantifierReceiverData) => (e: SyntheticEvent) => {
    history.push(
      `/quantify/period/${data.periodId}/receiver/${data.receiverId}`
    );
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
              onClick={handleClick(row.original as QuantifierReceiverData)}
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

export default PeriodReceiverTable;
