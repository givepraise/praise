import { faSortDown, faSortUp } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Listbox, Transition } from '@headlessui/react';
import { Fragment } from 'react';

interface ISelectedItem {
  key: string;
  label: string;
}

interface MultiselectInputProps {
  selected: ISelectedItem[];
  handleChange: (element) => void;
  options: ISelectedItem[];
}

const MultiselectInput = ({
  handleChange,
  selected,
  options,
}: MultiselectInputProps): JSX.Element => {
  return (
    <div className="relative w-60 border border-gray-400 h-[42px]">
      <Listbox value={selected} onChange={handleChange} multiple>
        <Listbox.Button className="text-xs pl-2 pr-8 text-left h-[42px] w-full bg-transparent border-none outline-none focus:ring-0 ">
          {({ open }): JSX.Element => (
            <>
              <span className="block truncate">
                {selected.length > 3
                  ? `${selected.length} items.`
                  : selected
                      .map((filter) =>
                        filter && filter.label ? filter.label : ''
                      )
                      .join(', ')}
              </span>

              <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                <span className="text-gray-800">
                  {open ? (
                    <FontAwesomeIcon icon={faSortDown} className="mt-[-1]" />
                  ) : (
                    <FontAwesomeIcon icon={faSortUp} className="mt-2" />
                  )}
                </span>
              </div>
            </>
          )}
        </Listbox.Button>
        <Transition
          as={Fragment}
          leave="transition ease-in duration-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <Listbox.Options className="absolute mt-1 max-h-60 w-full overflow-auto bg-white py-1 border border-gray-400 text-xs">
            {options.map((filter, filterIdx) => (
              <Listbox.Option
                key={filterIdx}
                className={({ active }): string =>
                  `relative cursor-default select-none py-2 pl-10 pr-4 ${
                    active ? 'bg-gray-100 text-gray-900' : 'text-gray-600'
                  }`
                }
                value={filter}
              >
                {({ selected }): JSX.Element => (
                  <>
                    <span
                      className={`block truncate ${
                        selected ? 'font-medium' : 'font-normal'
                      }`}
                    >
                      {filter.label}
                    </span>
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-600">
                      <input
                        type="checkbox"
                        className="mr-4 text-xs w-4 h-4 text-black focus:ring-0"
                        defaultChecked={selected}
                      />
                    </span>
                  </>
                )}
              </Listbox.Option>
            ))}
          </Listbox.Options>
        </Transition>
      </Listbox>
    </div>
  );
};

export default MultiselectInput;
