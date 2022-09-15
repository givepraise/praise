import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { faChevronDown } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Listbox, Transition } from '@headlessui/react';
import { Fragment } from 'react';

export interface ISelectedItem {
  value: string;
  label: string;
  disabled?: boolean;
}

interface SelectInputProps {
  selected: ISelectedItem;
  handleChange: (element) => void;
  options: ISelectedItem[];
  icon?: IconProp;
}

export const SelectInput = ({
  selected,
  handleChange,
  options,
  icon,
}: SelectInputProps): JSX.Element => {
  return (
    <div className="relative h-10">
      <Listbox value={selected} onChange={handleChange}>
        <Listbox.Button className="h-10 border border-warm-gray-400 w-full py-1.5 pl-3 pr-10 text-left bg-transparent  ">
          <span className="block truncate">{selected.label}</span>
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            <span className="text-warm-gray-800 ">
              <FontAwesomeIcon icon={icon || faChevronDown} />
            </span>
          </div>
        </Listbox.Button>
        <Transition
          as={Fragment}
          leave="transition ease-in duration-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <Listbox.Options className="absolute z-10 w-full py-1 mt-1 overflow-auto bg-white border border-warm-gray-400 max-h-60 dark:bg-slate-600">
            {options.map((s, sIdx) => {
              return (
                !s.disabled && (
                  <Listbox.Option
                    key={sIdx}
                    className={({ active }): string =>
                      `relative cursor-default select-none py-2 pl-4 pr-4  ${
                        active
                          ? 'bg-warm-gray-100 dark:bg-slate-700 text-warm-gray-900 dark:text-white'
                          : 'text-warm-gray-600 dark:text-white'
                      }`
                    }
                    value={s}
                    disabled={s.disabled}
                  >
                    {({ selected }): JSX.Element => (
                      <span
                        className={`block truncate ${
                          selected ? 'font-medium' : 'font-normal'
                        }`}
                      >
                        {s.label}
                      </span>
                    )}
                  </Listbox.Option>
                )
              );
            })}
          </Listbox.Options>
        </Transition>
      </Listbox>
    </div>
  );
};
