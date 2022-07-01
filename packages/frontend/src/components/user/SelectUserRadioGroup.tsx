import { faCheckCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { RadioGroup } from '@headlessui/react';
import { UserDto } from 'api/dist/user/types';
import { classNames } from '@/utils/index';
import { UserAvatarAndName } from './UserAvatarAndName';

interface Props {
  users?: UserDto[];
  value?: string;
  onSelect(userId: string): void;
}

export const SelectUserRadioGroup = ({
  users = [],
  value = undefined,
  onSelect,
}: Props): JSX.Element => {
  return (
    <RadioGroup value={value} onChange={onSelect} className="w-full">
      <div className="p-4 space-y-3 overflow-y-auto border rounded-lg max-h-64 dark:bg-slate-600 dark:text-white">
        {users.map((user) => (
          <RadioGroup.Option
            value={user._id}
            key={user._id}
            className={({ checked }): string =>
              classNames(
                checked
                  ? 'bg-warm-gray-200 hover:bg-warm-gray-300 dark:bg-slate-700 dark:hover:bg-slate-800'
                  : 'hover:bg-warm-gray-200 dark:hover:bg-slate-700 bg-warm-gray-100 dark:bg-slate-500',
                'relative flex cursor-pointer rounded-lg px-5 py-3'
              )
            }
          >
            {({ checked }): JSX.Element => (
              <div className="flex items-center justify-between w-full">
                <div className="flex flex-col justify-center">
                  <UserAvatarAndName user={user} avatarClassName="text-2xl" />
                </div>
                <div>
                  {checked && (
                    <FontAwesomeIcon icon={faCheckCircle} size="1x" />
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
