import { HasRole, ROLE_ADMIN } from "@/model/auth";
import {
  AllPeriodReceivers,
  ReceiverData,
  SinglePeriod,
  usePeriodPraiseQuery,
} from "@/model/periods";
import React, { SyntheticEvent } from "react";
import { useHistory, useParams } from "react-router-dom";
import { TableOptions, useSortBy, useTable } from "react-table";
import { useRecoilValue } from "recoil";

const ReceiverTable = () => {
  const history = useHistory();
  let { periodId } = useParams() as any;
  const period = useRecoilValue(SinglePeriod({ periodId }));
  const isAdmin = useRecoilValue(HasRole(ROLE_ADMIN));
  usePeriodPraiseQuery(periodId);
  const periodReceivers = useRecoilValue(AllPeriodReceivers({ periodId }));

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
        sortType: "basic",
      },
    ],
    []
  );

  const options = {
    columns,
    data: periodReceivers ? periodReceivers : [],
    initialState: {
      sortBy: [
        {
          id: period?.status === "OPEN" ? "praiseCount" : "praiseScore",
          desc: true,
        },
      ],
    },
  } as TableOptions<{}>;
  const tableInstance = useTable(options, useSortBy);

  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } =
    tableInstance;

  const handleClick = (data: ReceiverData) => (e: SyntheticEvent) => {
    history.push(`/period/${periodId}/receiver/${data.receiverId}`);
  };

  if (!period) return <div>Period not found.</div>;

  if (period.status === "QUANTIFY" && !isAdmin)
    return <div>Praise scores are not visible during quantification.</div>;

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
              onClick={handleClick(row.original as ReceiverData)}
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
