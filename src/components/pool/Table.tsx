import { isApiResponseOk } from "@/store/api";
import { AllQuantifierUsers, useAllUsersQuery } from "@/store/users";
import { shortenEthAddress } from "@/utils/index";
import React from "react";
import { TableOptions, useTable } from "react-table";
import { useRecoilValue } from "recoil";

const PoolTable = () => {
  const allUsersQueryResponse = useAllUsersQuery();
  const allQuantifierUsers = useRecoilValue(AllQuantifierUsers);

  const columns = React.useMemo(
    () => [
      {
        Header: "Eth address",
        accessor: "ethereumAddress",
        Cell: (data: any) => {
          return shortenEthAddress(data.value);
        },
      },
    ],
    []
  );

  const options = {
    columns,
    data: allQuantifierUsers ? allQuantifierUsers : [],
  } as TableOptions<{}>;
  const tableInstance = useTable(options);

  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } =
    tableInstance;

  if (!isApiResponseOk(allUsersQueryResponse))
    return <div>Unable to fetch user list.</div>;

  return (
    <table className="w-full table-auto" {...getTableProps()}>
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
              {...row.getRowProps()}
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

export default PoolTable;
