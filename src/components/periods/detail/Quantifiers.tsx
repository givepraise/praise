import {
  Period,
  PeriodQuantifiers,
  usePeriodPraisesQuery,
} from "@/model/periods";
import React, { SyntheticEvent } from "react";
import { useHistory, useParams } from "react-router-dom";
import { TableOptions, useTable } from "react-table";
import { useRecoilValue } from "recoil";

const Quantifiers = () => {
  const history = useHistory();
  let { id } = useParams() as any;
  usePeriodPraisesQuery(id);
  const periodQuantifiers = useRecoilValue(PeriodQuantifiers({ periodId: id }));

  const columns = React.useMemo(
    () => [
      {
        Header: "Quantifier",
        accessor: "quantifier",
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
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};

export default Quantifiers;
