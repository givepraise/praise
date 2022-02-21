import { AllUsers } from '@/model/users';
import { classNames } from '@/utils/index';
import { getUsername } from '@/utils/users';
import { faTimes, faUser } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Dialog } from '@headlessui/react';
import { UserDto, UserRole } from 'api/dist/user/types';
import { useCombobox } from 'downshift';
import React from 'react';
import { useRecoilValue } from 'recoil';

interface UserAutosuggestProps {
  onClose(): any;
  onQuantifierAdded(id: string): void;
}

const UserAutosuggest = ({
  onQuantifierAdded,
  onClose,
}: UserAutosuggestProps) => {
  const allUsers = useRecoilValue(AllUsers);

  const DropdownCombobox = () => {
    const [inputItems, setInputItems] = React.useState(
      allUsers ? allUsers : ([] as UserDto[])
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
              if (user.roles.includes(UserRole.QUANTIFIER)) return false;
              if (user._id?.includes(inputValue!.toLowerCase())) return true;
              if (
                user.ethereumAddress &&
                user.ethereumAddress.length > 0 &&
                user.ethereumAddress
                  .toLowerCase()
                  .includes(inputValue!.toLowerCase())
              )
                return true;
              if (
                user.accounts?.find((account) =>
                  account.name.toLowerCase().includes(inputValue!.toLowerCase())
                    ? true
                    : false
                )
              )
                return true;
              return false;
            })
          );
        }
      },
      onSelectedItemChange: (data: any) => {
        const selectedItem = data.selectedItem as UserDto;
        if (selectedItem._id) {
          onQuantifierAdded(selectedItem._id);
        }
        onClose();
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
            isOpen && inputItems.length > 0 ? '' : 'hidden',
            'absolute bg-white border w-80 mt-[1px]'
          )}
          {...getMenuProps()}
        >
          {isOpen &&
            inputItems.map((item, index) => (
              <li
                className={classNames(
                  highlightedIndex === index ? 'bg-gray-100' : '',
                  'py-2 pl-2'
                )}
                // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
                key={`${item}${index}`} //TODO fix
                {...getItemProps({ item, index })}
              >
                {getUsername(item)}
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
  onQuantifierAdded(id: string): void;
}
const PoolAddDialog = ({ onClose, onQuantifierAdded }: PoolAddDialogProps) => {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <Dialog.Overlay className="fixed inset-0 bg-gray-800 opacity-30" />
      <div className="relative max-w-xl pb-16 mx-auto bg-white rounded">
        <div className="flex justify-end p-6">
          <button className="praise-button-round" onClick={onClose}>
            <FontAwesomeIcon icon={faTimes} size="1x" />
          </button>
        </div>
        <div className="px-20">
          <div className="flex justify-center mb-7">
            <FontAwesomeIcon icon={faUser} size="2x" />
          </div>
          <Dialog.Title className="text-center mb-7">
            Add a member to the Quantifier Pool
          </Dialog.Title>
          <div className="flex justify-center">
            <UserAutosuggest
              onQuantifierAdded={onQuantifierAdded}
              onClose={onClose}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PoolAddDialog;
