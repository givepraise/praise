import LoaderSpinner from "@/components/LoaderSpinner";
import { AllPraiseList, Praise } from "@/model/praise";
import { formatDate } from "@/utils/date";
import React, { SyntheticEvent } from "react";
import { useHistory } from "react-router-dom";
import { TableOptions, useTable } from "react-table";
import { useRecoilValue } from "recoil";
import MyPraisePageLoader from "./MyPraisePageLoader";

const MyPraiseTable = () => {
  const history = useHistory();
  const allPraise = useRecoilValue(AllPraiseList);
  const columns = React.useMemo(
    () => [
      {
        Header: "Date",
        accessor: "createdAt",
        Cell: (data: any) => (
          <div className="whitespace-nowrap">{formatDate(data.value)}</div>
        ),
      },
      {
        Header: "From",
        accessor: "giver",
        Cell: (data: any) => {
          return `${data.value.username}`;
        },
      },
      {
        Header: "To",
        accessor: "receiver",
        Cell: (data: any) => {
          return `${data.value.username}`;
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
    data: allPraise ? allPraise : [],
  } as TableOptions<{}>;
  const tableInstance = useTable(options);

  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } =
    tableInstance;

  const handleClick = (data: Praise) => (e: SyntheticEvent) => {
    history.push(`/praise/${data._id}`);
  };

  return (
    <>
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
                onClick={handleClick(row.original as Praise)}
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
      <React.Suspense fallback={<LoaderSpinner />}>
        <MyPraisePageLoader />
      </React.Suspense>
    </>
  );
};

export default MyPraiseTable;
