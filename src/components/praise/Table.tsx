import {
  AllPraises,
  AllPraisesQueryPagination,
  useAllPraisesQuery,
} from "@/model/praise";
import React from "react";
import { TableOptions, useTable } from "react-table";
import { useRecoilState, useRecoilValue } from "recoil";
import PraisePageLoader from "./PraisePageLoader";

const LoadMoreButton = () => {
  const [praisePagination, setPraisePagination] = useRecoilState(
    AllPraisesQueryPagination
  );
  useAllPraisesQuery({ page: praisePagination.currentPageNumber, size: 10 });

  if (praisePagination.currentPageNumber >= praisePagination.totalPages - 1)
    return null;
  return (
    <div className="mt-2 text-center">
      <button
        className="praise-button"
        onClick={() =>
          setPraisePagination({
            ...praisePagination,
            currentPageNumber: praisePagination.currentPageNumber + 1,
          })
        }
      >
        Load more…
      </button>
    </div>
  );
};

const PraisesTable = () => {
  const allPraises = useRecoilValue(AllPraises);

  const columns = React.useMemo(
    () => [
      {
        Header: "Id",
        accessor: "id",
      },
      {
        Header: "Date",
        accessor: "createdAt",
        Cell: (data: any) => {
          // return formatDate(data.value);
          return "2021-09-15";
        },
      },
      {
        Header: "From",
        accessor: "giver",
        Cell: (data: any) => {
          return `${data.value.username}#${data.value.id}`;
        },
      },
      {
        Header: "To",
        accessor: "recipient",
        Cell: (data: any) => {
          return `${data.value.username}#${data.value.id}`;
        },
      },
      {
        Header: "Praise",
        accessor: "reason",
      },
    ],
    []
  );

  const options = {
    columns,
    data: allPraises ? allPraises : [],
  } as TableOptions<{}>;
  const tableInstance = useTable(options);

  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } =
    tableInstance;

  return (
    <>
      <React.Suspense fallback="Loading…">
        <table
          id="praises-table"
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
                  id={"praise-" + row.values.id}
                  {...row.getRowProps()}
                >
                  {row.cells.map((cell) => {
                    return (
                      <td {...cell.getCellProps()}>{cell.render("Cell")}</td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </React.Suspense>
      {/* <React.Suspense fallback="">
        <LoadMoreButton />
      </React.Suspense> */}
      <React.Suspense fallback="Loading…">
        <PraisePageLoader />
      </React.Suspense>      
    </>
  );
};

export default PraisesTable;
