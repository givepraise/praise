import { Period } from "@/model/periods";
import React, { SyntheticEvent } from "react";
import { useHistory } from "react-router-dom";
import { TableOptions, useTable } from "react-table";

const dummyData = [
  {
    quantifier: "Happy Salamander",
    finishedItems: "",
  },
  {
    quantifier: "Santas Helper",
    finishedItems: "",
  },
  {
    quantifier: "Daft Punk",
    finishedItems: "12/22",
  },
];

const Quantifiers = () => {
  const history = useHistory();

  const columns = React.useMemo(
    () => [
      {
        Header: "Quantifier",
        accessor: "quantifier",
      },
      {
        Header: "",
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
    <div className="praise-box w-2/3">

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
              onClick={handleClick((row.original as Period).id!)}
            >
              {row.cells.map((cell) => {
                return <td {...cell.getCellProps()}>{cell.render("Cell")}</td>;
              })}
            </tr>
          );
        })}
      </tbody>
    </table>
    </div>
  );
};

export default Quantifiers;
