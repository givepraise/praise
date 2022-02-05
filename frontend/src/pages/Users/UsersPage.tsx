import BreadCrumb from "@/components/BreadCrumb";
import { useAdminUsers, UserRole } from "@/model/users";
import PoolAddDialog from "@/pages/Users/components/AddDialog";
import { faPlus, faUserFriends } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Dialog } from "@headlessui/react";
import React from "react";
import UsersTable from "./components/UsersTable";

const AddRoleButton = () => {
  let [isOpen, setIsOpen] = React.useState(false);
  const { addRole } = useAdminUsers();

  //const addDialogRef = React.useRef(null);

  const handleAddQuantifierClick = () => {
    setIsOpen(true);
  };

  const handleQuantifierAdded = (id: string) => {
    addRole(id, UserRole.QUANTIFIER);
  };

  return (
    <>
      <button className="praise-button" onClick={handleAddQuantifierClick}>
        <FontAwesomeIcon icon={faPlus} size="1x" className="mr-2" />
        Add quantifier
        {isOpen ? (
          <Dialog
            open={isOpen}
            onClose={() => setIsOpen(false)}
            className="fixed inset-0 z-10 overflow-y-auto"
          >
            <div>
              <PoolAddDialog
                onClose={() => setIsOpen(false)}
                onQuantifierAdded={handleQuantifierAdded}
              />
            </div>
          </Dialog>
        ) : null}
      </button>
    </>
  );
};

const UsersPage = () => {
  return (
    <>
      <BreadCrumb name="Quantifier pool" icon={faUserFriends} />

      <div className="w-2/3 praise-box">
        <div className="mb-2 text-right">
          <React.Suspense fallback="Loading…">
            <AddRoleButton />
          </React.Suspense>
        </div>
        <UsersTable />
      </div>
    </>
  );
};

export default UsersPage;
