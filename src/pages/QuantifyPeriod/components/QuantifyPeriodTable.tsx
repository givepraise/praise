import {
  PeriodActiveQuantifierReceivers,
  QuantifierReceiverData,
} from "@/model/periods";
import { faChevronRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { SyntheticEvent } from "react";
import { useHistory, useParams } from "react-router-dom";
import { TableOptions, useTable } from "react-table";
import { useRecoilValue } from "recoil";

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
        Header: "Finished items",
        accessor: "finishedItems",
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

              <td>
                <FontAwesomeIcon
                  icon={faChevronRight}
                  size="1x"
                  className="inline-block"
                />
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};

export default QuantifyPeriodTable;
