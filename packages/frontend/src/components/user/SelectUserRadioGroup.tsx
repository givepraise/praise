import { classNames } from '@/utils/index';
import { faCheckCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { RadioGroup } from '@headlessui/react';
import { UserAvatarAndName } from './UserAvatarAndName';

interface Props {
  userIds?: string[];
  value?: string;
  onSelect(userId: string): void;
}

const SelectUserRadioGroup = ({
  userIds = [],
  value = undefined,
  onSelect,
}: Props): JSX.Element => {
  return (
    <RadioGroup value={value} onChange={onSelect} className="w-full">
      <div className="space-y-2 p-4 h-64 overflow-y-scroll">
        {userIds.map((userId) => (
          <RadioGroup.Option
            value={userId}
            key={userId}
            className={({ active, checked }): string =>
              classNames(
                active
                  ? 'ring-2 ring-white ring-opacity-60 ring-offset-2 ring-offset-sky-300'
                  : '',
                checked ? 'bg-sky-900 bg-opacity-75 text-white' : 'bg-white',
                'relative flex cursor-pointer rounded-lg px-5 py-4 shadow-md focus:outline-none'
              )
            }
          >
            {({ active, checked }): JSX.Element => (
              <div className="flex w-full items-center justify-between">
                <div className="text-lg mx-4 pr-8">
                  <UserAvatarAndName userId={userId} />
                </div>
                <div className="shrink-0 w-8 text-white">
                  {checked && (
                    <FontAwesomeIcon icon={faCheckCircle} size="2x" />
                  )}
                </div>
              </div>
            )}
          </RadioGroup.Option>
        ))}
      </div>
    </RadioGroup>
  );
};

export default SelectUserRadioGroup;
