import { isApiResponseOk } from "@/model/api";
import { AllQuantifierUsers, useAllUsersQuery, UserIdentity } from "@/model/users";
import React from "react";
import { TableOptions, useTable } from "react-table";
import { useRecoilValue } from "recoil";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { Dialog } from "@headlessui/react";
import PoolDeleteDialog from "@/components/pool/DeleteDialog";

const PoolTable = () => {
  const allUsersQueryResponse = useAllUsersQuery();
  const allQuantifierUsers = useRecoilValue(AllQuantifierUsers);

  let [isOpen, setIsOpen] = React.useState(false);
  let [selectedQuantifier, setSelectedQuantifier] = React.useState<UserIdentity>();

  const columns = React.useMemo(
    () => [
      {
        Header: "User id",
        accessor: "id",
        Cell: (data: any) => {
          //return shortenEthAddress(data.value);
          return data.value;
        },
      },
    ],
    []
  );

  let options = {
    columns,
    data: allQuantifierUsers ? allQuantifierUsers : [],
  } as TableOptions<{}>;
  const tableInstance = useTable(options);

  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } =
    tableInstance;  

  if (!isApiResponseOk(allUsersQueryResponse))
    return <div>Unable to fetch user list.</div>;
  
  const handleDeleteQuantifierClick = (quantifier: UserIdentity) => {    
    setSelectedQuantifier(quantifier);
    setIsOpen(true);
  }

  const removeQuantifier = (id: number) => {
    /** TODO: remove quantifier from list of all quantifiers */    
  }

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
                return <td {...cell.getCellProps()}>{cell.render("Cell")}</td>                                                      
              })}
              <td>
                <button onClick={() => handleDeleteQuantifierClick(row.original as UserIdentity)}>
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
            <PoolDeleteDialog onClose={() => setIsOpen(false)} onQuantifierRemoved={(id: number) => removeQuantifier(id)} quantifier={selectedQuantifier} />            
          </Dialog>          
        </React.Suspense>

      </tbody>
    </table>
  );
};

export default PoolTable;
