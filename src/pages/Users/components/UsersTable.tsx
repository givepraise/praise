import {
  AllQuantifierUsers,
  useAdminUsers,
  User,
  UserRole,
} from "@/model/users";
import { shortenEthAddress } from "@/utils/index";
import { getProfileImageUrl, getUsername } from "@/utils/users";
import { faTimesCircle, faUserCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Dialog } from "@headlessui/react";
import React from "react";
import { TableOptions, useTable } from "react-table";
import { useRecoilValue } from "recoil";
import PoolDeleteDialog from "./DeleteDialog";

const UsersTable = () => {
  const allQuantifierUsers = useRecoilValue(AllQuantifierUsers);
  const { removeRole } = useAdminUsers();

  const deleteDialogRef = React.useRef(null);

  let [isOpen, setIsOpen] = React.useState(false);
  let [selectedQuantifier, setSelectedQuantifier] = React.useState<User>();

  const columns = React.useMemo(
    () => [
      {
        Header: "Id",
        accessor: "_id",
        Cell: (data: any) => {
          return (
            <div className="flex items-center w-full">
              <div className="flex items-center">
                {data.row.original.accounts?.length > 0 ? (
                  <img
                    alt="avatar"
                    className="w-8 rounded-full"
                    src={getProfileImageUrl(data.row.original, 64)}
                  />
                ) : (
                  <FontAwesomeIcon icon={faUserCircle} size="2x" />
                )}
              </div>
              <div className="flex-grow p-3 whitespace-nowrap">
                {data.row.original.accounts?.length > 0 ? (
                  <div>{getUsername(data.row.original)}</div>
                ) : (
                  ""
                )}
                {shortenEthAddress(data.row.original.ethereumAddress)}
              </div>
            </div>
          );
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

  const { getTableProps, getTableBodyProps, rows, prepareRow } = tableInstance;

  if (!allQuantifierUsers)
    return <div>There are no users in the Quantifier pool.</div>;

  const handleDeleteQuantifierClick = (quantifier: User) => {
    setSelectedQuantifier(quantifier);
    setIsOpen(true);
  };

  const removeQuantifier = (id: string) => {
    removeRole(id, UserRole.QUANTIFIER);
  };

  return (
    <table className="w-full table-auto" {...getTableProps()}>
      <tbody {...getTableBodyProps()}>
        {rows.map((row) => {
          prepareRow(row);
          return (
            <tr {...row.getRowProps()}>
              {row.cells.map((cell) => {
                return <td {...cell.getCellProps()}>{cell.render("Cell")}</td>;
              })}
              <td className="w-8">
                <button
                  onClick={() =>
                    handleDeleteQuantifierClick(row.original as User)
                  }
                  className="hover:text-red-600"
                >
                  <FontAwesomeIcon
                    icon={faTimesCircle}
                    size="1x"
                    className="inline-block"
                  />
                </button>
              </td>
            </tr>
          );
        })}

        {isOpen ? (
          <Dialog
            open={isOpen && !!selectedQuantifier}
            onClose={() => setIsOpen(false)}
            className="fixed inset-0 z-10 overflow-y-auto"
            initialFocus={deleteDialogRef}
          >
            <div ref={deleteDialogRef}>
              <PoolDeleteDialog
                onClose={() => setIsOpen(false)}
                onQuantifierRemoved={(id: string) => removeQuantifier(id)}
                quantifier={selectedQuantifier}
              />
            </div>
          </Dialog>
        ) : null}
      </tbody>
    </table>
  );
};

export default UsersTable;
