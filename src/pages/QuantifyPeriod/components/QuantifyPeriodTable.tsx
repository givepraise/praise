import {
  PeriodActiveQuantifierReceivers,
  QuantifierReceiverData,
} from "@/model/periods";
import { faCheckCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { SyntheticEvent } from "react";
import { useHistory, useParams } from "react-router-dom";
import { TableOptions, useTable } from "react-table";
import { useRecoilValue } from "recoil";

const DoneLabel = () => {
  return (
    <div className="pl-1 pr-1 ml-2 text-xs text-white no-underline bg-green-400 py-[3px] rounded inline-block relative top-[-1px]">
      <FontAwesomeIcon icon={faCheckCircle} size="1x" className="mr-2" />
      Done
    </div>
  );
};

const QuantifyPeriodTable = () => {
  const history = useHistory();
  let { periodId } = useParams() as any;

  const data = useRecoilValue(PeriodActiveQuantifierReceivers({ periodId }));

  const columns = React.useMemo(
    () => [
      {
        Header: "Receiver",
        accessor: "receiverName",
      },
      {
        Header: "Remaining items",
        accessor: "count",
        Cell: (data: any) => {
          const item = data.row.original;
          if (!item) return null;
          return `${item.count - item.done} / ${item.count}`;
        },
      },
      {
        Header: "",
        accessor: "done",
        Cell: (data: any) => {
          const item = data.row.original;
          if (!item) return null;
          return item.count - item.done === 0 ? (
            <div className="w-full text-right">
              <DoneLabel />
            </div>
          ) : null;
        },
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

export default QuantifyPeriodTable;
