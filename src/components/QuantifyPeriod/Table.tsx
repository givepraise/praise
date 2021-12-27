import { Period } from "@/model/periods";
import { faChevronRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { SyntheticEvent } from "react";
import { useHistory } from "react-router-dom";
import { TableOptions, useTable } from "react-table";

const dummyData = [
  {
    receiver: "Happy Salamander",
    finishedItems: "17/17",
  },
  {
    receiver: "Santas Helper",
    finishedItems: "2/34",
  },
  {
    receiver: "Daft Punk",
    finishedItems: "12/22",
  },
];

const QuantifyOverviewTable = () => {
  const history = useHistory();

  const columns = React.useMemo(
    () => [
      {
        Header: "Receiver",
        accessor: "receiver",
      },
      {
        Header: "Finished items",
        accessor: "finishedItems",
      },
    ],
    []
  );

  const options = {
    columns,
    data: dummyData,
  } as TableOptions<{}>;
  const tableInstance = useTable(options);

  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } =
    tableInstance;

  const handleClick = (id: number) => (e: SyntheticEvent) => {
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

export default QuantifyOverviewTable;
