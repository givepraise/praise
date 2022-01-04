import BreadCrumb from "@/components/BreadCrumb";
import PoolAddDialog from "@/components/pool/AddDialog";
import PoolTable from "@/components/pool/Table";
import { useAdminUsers, UserRole } from "@/model/users";
import { faUserFriends } from "@fortawesome/free-solid-svg-icons";
import { Dialog } from "@headlessui/react";
import React from "react";

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

const PoolPage = () => {
  return (
    <>
      <BreadCrumb name="Quantifier pool" icon={faUserFriends} />

      <div className="w-2/3 praise-box">
        <div className="mb-2 text-right">
          <React.Suspense fallback="Loading…">
            <AddRoleButton />
          </React.Suspense>
        </div>
        <PoolTable />
      </div>
    </>
  );
};

export default PoolPage;
