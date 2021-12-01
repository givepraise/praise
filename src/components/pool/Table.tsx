import PoolDeleteDialog from "@/components/pool/DeleteDialog";
import { isApiResponseOk } from "@/model/api";
import {
  AllQuantifierUsers,
  useAdminUsers,
  useAllUsersQuery,
  UserIdentity,
  USER_INDENTITY_ROLE,
} from "@/model/users";
import { faTrash, faUserCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Dialog } from "@headlessui/react";
import React from "react";
import { TableOptions, useTable } from "react-table";
import { useRecoilValue } from "recoil";

const PoolTable = () => {
  const allUsersQueryResponse = useAllUsersQuery();
  const allQuantifierUsers = useRecoilValue(AllQuantifierUsers);
  const { removeRole } = useAdminUsers();

  let [isOpen, setIsOpen] = React.useState(false);
  let [selectedQuantifier, setSelectedQuantifier] =
    React.useState<UserIdentity>();

  const columns = React.useMemo(
    () => [
      {
        Header: "Id",
        accessor: "id",
        Cell: (data: any) => {          
          return (
            <div className="flex items-center w-full">
              <div className="flex items-center">
                <FontAwesomeIcon icon={faUserCircle} size="2x" />
              </div>
              <div className="flex-grow p-3 whitespace-nowrap">
                #{data.row.original.id}
                <br />
                John Doe
              </div>
            </div>
          );
        },
      },
      {
        Header: "Ethereum Address",
        accessor: "ethereumAddress",
        Cell: (data: any) => {
          // return shortenEthAddress(data.value);
          return data.value;
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

  const { getTableProps, getTableBodyProps, rows, prepareRow } =
    tableInstance;

  if (!isApiResponseOk(allUsersQueryResponse))
    return <div>Unable to fetch user list.</div>;

  const handleDeleteQuantifierClick = (quantifier: UserIdentity) => {
    setSelectedQuantifier(quantifier);
    setIsOpen(true);
  };

  const removeQuantifier = (id: number) => {    
    removeRole(id, USER_INDENTITY_ROLE.Quantifier);
  };

  return (
    <table className="w-full table-auto" {...getTableProps()}>
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
              <td>
                <button
                  onClick={() =>
                    handleDeleteQuantifierClick(row.original as UserIdentity)
                  }
                >
                  <FontAwesomeIcon
                    icon={faTrash}
                    size="1x"
                    className="inline-block"
                  />
                </button>
              </td>
            </tr>
          );
        })}

        <React.Suspense fallback={null}>
          <Dialog
            open={isOpen && !!selectedQuantifier}
            onClose={() => setIsOpen(false)}
            className="fixed inset-0 z-10 overflow-y-auto"
          >
            <PoolDeleteDialog
              onClose={() => setIsOpen(false)}
              onQuantifierRemoved={(id: number) => removeQuantifier(id)}
              quantifier={selectedQuantifier}
            />
          </Dialog>
        </React.Suspense>
      </tbody>
    </table>
  );
};

export default PoolTable;
