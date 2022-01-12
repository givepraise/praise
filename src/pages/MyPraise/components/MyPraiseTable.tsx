import LoaderSpinner from "@/components/LoaderSpinner";
import { AllPraiseList, Praise } from "@/model/praise";
import { formatDate } from "@/utils/date";
import { faSadTear, faUserCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { SyntheticEvent } from "react";
import { useHistory } from "react-router-dom";
import { TableOptions, useTable } from "react-table";
import { useRecoilValue } from "recoil";
import MyPraisePageLoader from "./MyPraisePageLoader";

export const MY_PRAISE_LIST_KEY = "MY_PRAISE";

const MyPraiseTable = () => {
  const history = useHistory();
  const allPraise = useRecoilValue(AllPraiseList(MY_PRAISE_LIST_KEY));
  const columns = React.useMemo(
    () => [
      {
        accessor: "createdAt",
        Cell: (data: any) => (
          <div className="flex items-center w-full">
            <div className="flex items-center">
              <FontAwesomeIcon icon={faUserCircle} size="2x" />
            </div>
            <div className="flex-grow p-3 whitespace-nowrap">
              {formatDate(data.row.original.createdAt)}
              <br />
              Giver: {data.row.original.giver.username}
              <br />
              Receiver: {data.row.original.receiver.username}
            </div>
          </div>
        ),
      },
      {
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

  const { getTableProps, getTableBodyProps, rows, prepareRow } = tableInstance;

  const handleClick = (data: Praise) => (e: SyntheticEvent) => {
    history.push(`/praise/${data._id}`);
  };

  if (!allPraise)
    return (
      <div>
        {" "}
        <FontAwesomeIcon icon={faSadTear} size="2x" className="mr-2" />
        <div className="mt-3">You have not yet received any praise.</div>
      </div>
    );
  return (
    <>
      <table
        id="praises-table"
        className="w-full table-auto"
        {...getTableProps()}
      >
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
