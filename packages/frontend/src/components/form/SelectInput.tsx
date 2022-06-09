import { faArrowDownShortWide } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Listbox, Transition } from '@headlessui/react';
import { Fragment } from 'react';

interface ISelectedItem {
  value: string;
  label: string;
}

interface SelectInputProps {
  selected: ISelectedItem;
  handleChange: (element) => void;
  options: ISelectedItem[];
}

const SelectInput = ({
  selected,
  handleChange,
  options,
}: SelectInputProps): JSX.Element => {
  return (
    <div className="relative w-40">
      <Listbox value={selected} onChange={handleChange}>
        <Listbox.Button className="border border-black w-full py-1.5 h-12 pl-3 pr-10 text-left bg-transparent ">
          <span className="block truncate">{selected.label}</span>
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            <span className="text-gray-800 ">
              <FontAwesomeIcon icon={faArrowDownShortWide} />
            </span>
          </div>
        </Listbox.Button>
        <Transition
          as={Fragment}
          leave="transition ease-in duration-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <Listbox.Options className="absolute mt-1 max-h-60 w-full overflow-auto bg-white py-1 border border-black">
            {options.map((s, sIdx) => (
              <Listbox.Option
                key={sIdx}
                className={({ active }): string =>
                  `relative cursor-default select-none py-2 pl-10 pr-4 ${
                    active ? 'bg-gray-100 text-gray-900' : 'text-gray-600'
                  }`
                }
                value={s}
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
            ))}
          </Listbox.Options>
        </Transition>
      </Listbox>
    </div>
  );
};

export default SelectInput;
