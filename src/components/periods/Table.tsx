import { AllPeriods, Period, useAllPeriodsQuery } from "@/model/periods";
import { formatDate } from "@/utils/date";
import { faChevronRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { SyntheticEvent } from "react";
import { useHistory } from "react-router-dom";
import { TableOptions, useTable } from "react-table";
import { useRecoilValue } from "recoil";

const PeriodsTable = () => {
  useAllPeriodsQuery();
  const allPeriods = useRecoilValue(AllPeriods);
  const history = useHistory();

  const columns = React.useMemo(
    () => [
      {
        Header: "Period",
        accessor: "name",
      },
      {
        Header: "End date",
        accessor: "endDate",
        Cell: (data: any) => {
          return formatDate(data.value);
        },
      },
    ],
    []
  );

  const options = {
    columns,
    data: allPeriods ? allPeriods : [],
  } as TableOptions<{}>;
  const tableInstance = useTable(options);

  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } =
    tableInstance;

  if (!Array.isArray(allPeriods) || allPeriods.length === 0)
    return <div>Create your first period to get started quantifying.</div>;

  const handleClick = (id: number) => (e: SyntheticEvent) => {
    history.push(`/periods/${id}`);
  };
  return (
    <table 
      id="periods-table"
      className="w-full table-auto" {...getTableProps()}>
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
              <td>
                <div className="inline-block px-2 py-1 text-xs text-white bg-black rounded-full">
                  open
                </div>
              </td>
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

export default PeriodsTable;
