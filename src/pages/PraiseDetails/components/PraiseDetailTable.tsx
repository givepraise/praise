import { UserCell } from "@/components/table/UserCell";
import { HasRole, ROLE_ADMIN } from "@/model/auth";
import { SinglePeriodByDate } from "@/model/periods";
import { SinglePraise } from "@/model/praise";
import { formatDate } from "@/utils/date";
import { faCheckCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";
import { useParams } from "react-router-dom";
import { TableOptions, useTable } from "react-table";
import { useRecoilValue } from "recoil";

const PraiseDetailTable = () => {
  let { praiseId } = useParams() as any;

  const praise = useRecoilValue(SinglePraise(praiseId));
  const period = useRecoilValue(SinglePeriodByDate(praise?.createdAt));
  const isAdmin = useRecoilValue(HasRole(ROLE_ADMIN));

  const columns = React.useMemo(
    () => [
      {
        Header: "Quantifier",
        accessor: "quantifier",
        Cell: (data: any) => <UserCell userId={data.value} />,
      },
      {
        Header: "Date",
        accessor: "updatedAt",
        Cell: (data: any) => formatDate(data.value),
      },
      {
        Header: "Score",
        accessor: "score",
      },
      {
        Header: "Dismissed",
        accessor: "dismissed",
        Cell: (data: any) =>
          data.value === true ? (
            <FontAwesomeIcon icon={faCheckCircle} size="1x" />
          ) : (
            ""
          ),
      },
      {
        Header: "Duplicate",
        accessor: "duplicatePraise",
        Cell: (data: any) => (data.value ? `#${data.value.slice(-4)}` : ""),
      },
    ],
    []
  );

  const options = {
    columns,
    data: praise ? praise.quantifications : [],
  } as TableOptions<{}>;
  const tableInstance = useTable(options);

  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } =
    tableInstance;

  if (!period) return <div>Could not load praise details.</div>;

  if (period.status === "QUANTIFY" && !isAdmin)
    return <div>Praise scores are not visible during quantification.</div>;

  if (period.status === "OPEN")
    return <div>This praise has not been quantified yet.</div>;

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
            <tr id={"period-" + row.values.name} {...row.getRowProps()}>
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

export default PraiseDetailTable;
