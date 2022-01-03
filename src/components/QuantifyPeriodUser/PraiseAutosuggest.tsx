import { AllUsers, User } from "@/model/users";
import { classNames } from "@/utils/index";
import { faUser } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useCombobox } from "downshift";
import React from "react";
import { useRecoilValue } from "recoil";

interface PraiseAutosuggestProps {
  onSelect(): any;
}

const PraiseAutosuggest = ({ onSelect }: PraiseAutosuggestProps) => {
  const allUsers = useRecoilValue(AllUsers);

  const DropdownCombobox = () => {
    const [inputItems, setInputItems] = React.useState(
      allUsers ? allUsers : ([] as User[])
    );
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
        if (allUsers) {
          setInputItems(
            allUsers.filter((user) => {
              if (user._id.toString().includes(inputValue!.toLowerCase()))
                return true;
              if (
                user.ethereumAddress &&
                user.ethereumAddress.length > 0 &&
                user.ethereumAddress
                  .toLowerCase()
                  .includes(inputValue!.toLowerCase())
              )
                return true;
              return false;
            })
          );
        }
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
                {item._id}
              </li>
            ))}
        </ul>
      </div>
    );
  };
  return <DropdownCombobox />;
};

export default PraiseAutosuggest;
