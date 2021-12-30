import BreadCrumb from "@/components/BreadCrumb";
import PoolAddDialog from "@/components/pool/AddDialog";
import PoolTable from "@/components/pool/Table";
import { useAdminUsers, UserRole } from "@/model/users";
import { faUserFriends } from "@fortawesome/free-solid-svg-icons";
import { Dialog } from "@headlessui/react";
import React from "react";

const PoolPage = () => {
  let [isOpen, setIsOpen] = React.useState(false);
  const { addRole } = useAdminUsers();

  const handleAddQuantifierClick = () => {
    setIsOpen(true);
  };

  const handleQuantifierAdded = (id: string) => {
    addRole(id, UserRole.QUANTIFIER);
  };

  return (
    <>
      <BreadCrumb name="Quantifier pool" icon={faUserFriends} />

      <div className="w-2/3 praise-box">
        <div className="mb-2 text-right">
          <button className="praise-button" onClick={handleAddQuantifierClick}>
            Add quantifier
          </button>
        </div>
        <React.Suspense fallback={null}>
          <Dialog
            open={isOpen}
            onClose={() => setIsOpen(false)}
            className="fixed inset-0 z-10 overflow-y-auto"
          >
            <PoolAddDialog
              onClose={() => setIsOpen(false)}
              onQuantifierAdded={handleQuantifierAdded}
            />
          </Dialog>
          <PoolTable />
        </React.Suspense>
      </div>
    </>
  );
};

export default PoolPage;
