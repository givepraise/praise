import { AllUsers } from "@/store/users";
import { classNames, shortenEthAddress } from "@/utils/index";
import {
  faTimes,
  faUser,
  faUserFriends,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Dialog } from "@headlessui/react";
import { useCombobox } from "downshift";
import React from "react";
import { useRecoilValue } from "recoil";

const UserAutosuggest = () => {
  const allUsers = useRecoilValue(AllUsers);

  const DropdownCombobox = () => {
    const [inputItems, setInputItems] = React.useState(allUsers);
    const {
      isOpen,
      getMenuProps,
      getInputProps,
      getComboboxProps,
      highlightedIndex,
      getItemProps,
    } = useCombobox({
      items: inputItems,
      onInputValueChange: ({ inputValue }) => {
        setInputItems(
          allUsers.filter((user) =>
            user.ethereumAddress
              .toLowerCase()
              .includes(inputValue!.toLowerCase())
          )
        );
      },
      onSelectedItemChange: (selectedItem: any) => {
        alert(JSON.stringify(selectedItem));
      },
    });
    return (
      <div>
        <div {...getComboboxProps()}>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <span className="text-gray-500 sm:text-sm">
                <FontAwesomeIcon icon={faUser} />
              </span>
            </div>
            <input
              className="pl-8 text-sm w-80"
              type="text"
              placeholder="Search by Discord or Telegram Handle"
              {...getInputProps()}
            />
          </div>
        </div>
        <ul
          className={classNames(
            isOpen && inputItems.length > 0 ? "" : "hidden",
            "absolute bg-white border w-80 mt-[1px]"
          )}
          {...getMenuProps()}
        >
          {isOpen &&
            inputItems.map((item, index) => (
              <li
                className={classNames(
                  highlightedIndex === index ? "bg-gray-100" : "",
                  "py-2 pl-2"
                )}
                key={`${item}${index}`}
                {...getItemProps({ item, index })}
              >
                {shortenEthAddress(item.ethereumAddress)}
              </li>
            ))}
        </ul>
      </div>
    );
  };
  return <DropdownCombobox />;
};

interface PoolAddDialogProps {
  onClose(): any;
}
const PoolAddDialog = ({ onClose }: PoolAddDialogProps) => {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />
      <div className="relative max-w-xl pb-16 mx-auto bg-white rounded">
        <div className="flex justify-end p-6">
          <button className="praise-button-round" onClick={onClose}>
            <FontAwesomeIcon icon={faTimes} size="1x" />
          </button>
        </div>
        <div className="px-20">
          <div className="flex justify-center mb-7">
            <FontAwesomeIcon icon={faUserFriends} size="2x" />
          </div>
          <Dialog.Title className="text-center mb-7">
            Add a member to the Quantifier Pool
          </Dialog.Title>
          <div className="flex justify-center">
            <UserAutosuggest />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PoolAddDialog;
