import { Period } from "@/model/periods";
import { faChevronRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { SyntheticEvent } from "react";
import { TableOptions, useTable } from "react-table";

const dummyData = [
  {
    receiver: "Happy Salamander",
    number_of_praise: "17",
    total_praise_score: "111",
  },
  {
    receiver: "Santas Helper",
    number_of_praise: "17",
    total_praise_score: "111",
  },
  {
    receiver: "Daft Punk",
    number_of_praise: "17",
    total_praise_score: "111",
  },
];

const PeriodSummary = () => {
  const columns = React.useMemo(
    () => [
      {
        Header: "Receiver",
        accessor: "receiver",
      },
      {
        Header: "Number of praise",
        accessor: "number_of_praise",
      },
      {
        Header: "Total praise score",
        accessor: "total_praise_score",
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
    /** TODO: go to period summary */
  };
  return (
    <div className="w-2/3 praise-box">
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
                  return (
                    <td {...cell.getCellProps()}>{cell.render("Cell")}</td>
                  );
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
    </div>
  );
};

export default PeriodSummary;
