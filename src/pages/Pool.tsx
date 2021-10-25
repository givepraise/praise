import BreadCrumb from "@/components/BreadCrumb";
import PoolAddDialog from "@/components/pool/AddDialog";
import PoolTable from "@/components/pool/Table";
import { faUserFriends } from "@fortawesome/free-solid-svg-icons";
import { Dialog } from "@headlessui/react";
import React from "react";

const PoolPage = () => {
  let [isOpen, setIsOpen] = React.useState(false);

  const handleAddQuantifierClick = () => {
    setIsOpen(true);
  };

  return (
    <>
      <BreadCrumb name="Quantifier pool" icon={faUserFriends} />

      <div className="praise-box">
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
            <PoolAddDialog onClose={() => setIsOpen(false)} />
          </Dialog>
          <PoolTable />
        </React.Suspense>
      </div>
    </>
  );
};

export default PoolPage;
