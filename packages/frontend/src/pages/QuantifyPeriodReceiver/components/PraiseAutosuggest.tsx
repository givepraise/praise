import { faPrayingHands } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Praise } from '@/model/praise/praise.dto';
import { useCombobox } from 'downshift';
import React, { useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import { classNames } from '@/utils/index';
import { SinglePeriodSettingValueRealized } from '@/model/periodsettings/periodsettings';
import {
  PeriodAndReceiverPageParams,
  PeriodQuantifierReceiverPraise,
} from '@/model/periods/periods';
import { ActiveUserId } from '@/model/auth/auth';
import { UserPseudonym } from '@/components/user/UserPseudonym';
import { idLabel } from '@/model/praise/praise.utils';

interface PraiseAutosuggestProps {
  onClose(): void;
  onSelect(id: string): void;
  praise: Praise;
}

export const PraiseAutosuggest = ({
  onSelect,
  onClose,
  praise,
}: PraiseAutosuggestProps): JSX.Element | null => {
  const inputRef = useRef<HTMLInputElement>(null);

  const { periodId, receiverId } = useParams<PeriodAndReceiverPageParams>();
  const userId = useRecoilValue(ActiveUserId);
  const data = useRecoilValue(
    PeriodQuantifierReceiverPraise({ periodId, receiverId })
  );

  const usePseudonyms = useRecoilValue(
    SinglePeriodSettingValueRealized({
      periodId,
      key: 'PRAISE_QUANTIFY_RECEIVER_PSEUDONYMS',
    })
  ) as boolean;

  useEffect(() => {
    if (inputRef && inputRef.current) {
      inputRef.current.focus();
    }
  }, [inputRef]);

  if (!data) return null;

  const filteredData = data.filter(
    (p) =>
      p &&
      p.quantifications.findIndex((quant) => quant.quantifier === userId) >=
        0 &&
      p.receiver._id === receiverId &&
      p._id !== praise._id
  );

  const DropdownCombobox = (): JSX.Element => {
    const [inputItems, setInputItems] = React.useState(filteredData);
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
        const search = inputValue
          ? inputValue.toLocaleLowerCase().replace('#', '').trim()
          : '';
        if (filteredData) {
          setInputItems(
            filteredData.filter((praise) =>
              idLabel(praise?._id).includes(search)
            )
          );
        }
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      onSelectedItemChange: (data: any): void => {
        if (!data) return;
        const selectedItem = data.selectedItem as Praise;
        onSelect(selectedItem._id);
        onClose();
      },
    });
    return (
      <div>
        <div {...getComboboxProps()}>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <span className="text-warm-gray-500 sm:text-sm dark:text-white">
                <FontAwesomeIcon icon={faPrayingHands} />
              </span>
            </div>
            <input
              className="pl-10 text-sm w-80"
              type="text"
              placeholder="Search by praise id"
              {...getInputProps({ ref: inputRef })}
            />
          </div>
        </div>
        <ul
          className={classNames(
            isOpen && inputItems.length > 0 ? '' : 'hidden',
            'absolute bg-white border w-80 mt-[1px] dark:bg-slate-600'
          )}
          {...getMenuProps()}
        >
          {isOpen &&
            inputItems.map((item, index) => (
              <li
                className={classNames(
                  highlightedIndex === index
                    ? 'bg-warm-gray-100 dark:bg-slate-500'
                    : '',
                  'py-2 pl-2 cursor-pointer'
                )}
                key={item._id}
                {...getItemProps({ item, index })}
              >
                {idLabel(item._id)} -{' '}
                {usePseudonyms ? (
                  <UserPseudonym userId={item.giver._id} periodId={periodId} />
                ) : (
                  item.giver.name
                )}
              </li>
            ))}
        </ul>
      </div>
    );
  };
  return <DropdownCombobox />;
};
