import { UserPseudonym } from '@/components/user/UserPseudonym';
import { ActiveUserId } from '@/model/auth';
import { AllPeriodPraiseList } from '@/model/periods';
import { PraiseDto } from '@/model/praise';
import { SingleBooleanSetting } from '@/model/settings';
import { classNames } from '@/utils/index';
import { faPrayingHands } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useCombobox } from 'downshift';
import React from 'react';
import { useParams } from 'react-router-dom';
import { useRecoilValue } from 'recoil';

interface PraiseAutosuggestProps {
  onClose(): any;
  onSelect(id: string): void;
  praise: PraiseDto;
}

const PraiseAutosuggest = ({
  onSelect,
  onClose,
  praise,
}: PraiseAutosuggestProps) => {
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
  const { periodId, receiverId } = useParams() as any;
  const userId = useRecoilValue(ActiveUserId);

  const data = useRecoilValue(AllPeriodPraiseList({ periodId }));
  const usePseudonyms = useRecoilValue(
    SingleBooleanSetting('PRAISE_QUANTIFY_RECEIVER_PSEUDONYMS')
  );

  if (!data) return null;

  const filteredData = data.filter(
    (p) =>
      p &&
      p.quantifications!.findIndex((quant) => quant.quantifier === userId) >=
        0 &&
      p.receiver._id! === receiverId &&
      p._id !== praise._id
  );

  const DropdownCombobox = () => {
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
        if (filteredData) {
          setInputItems(
            filteredData.filter((praise) => {
              if (
                praise &&
                `#${praise._id.slice(-4)}`.includes(inputValue!.toLowerCase())
              )
                return true;
              return false;
            })
          );
        }
      },
      onSelectedItemChange: (data: any) => {
        if (!data) return;
        const selectedItem = data.selectedItem as PraiseDto;
        onSelect(selectedItem._id);
        onClose();
      },
    });
    return (
      <div>
        <div {...getComboboxProps()}>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <span className="text-gray-500 sm:text-sm">
                <FontAwesomeIcon icon={faPrayingHands} />
              </span>
            </div>
            <input
              className="pl-10 text-sm w-80"
              type="text"
              placeholder="Search by praise id"
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
                key="" //TODO fix key
                {...getItemProps({ item, index })}
              >
                #{item && item._id.slice(-4)} -{' '}
                {item &&
                  (usePseudonyms ? (
                    <UserPseudonym
                      userId={item.giver._id!}
                      periodId={periodId}
                    />
                  ) : (
                    item.giver.username
                  ))}
              </li>
            ))}
        </ul>
      </div>
    );
  };
  return <DropdownCombobox />;
};

export default PraiseAutosuggest;
