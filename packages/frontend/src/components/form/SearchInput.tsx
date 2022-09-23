import {
  faMagnifyingGlass,
  faCircleXmark,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';

interface SearchInputProps {
  handleChange: (element) => void;
  value?: string;
  placeholder?: string;
  handleClear?: (element) => void;
}

export const SearchInput = ({
  handleChange,
  value,
  placeholder = 'Search',
  handleClear,
}: SearchInputProps): JSX.Element => {
  return (
    <div className="relative flex items-center h-10 overflow-hidden border border-warm-gray-400">
      <div className="absolute inset-y-0 left-0 flex items-center pl-3">
        <span className="text-warm-gray-800 dark:text-white">
          <FontAwesomeIcon
            icon={faMagnifyingGlass}
            size="1x"
            className="absolute transform -translate-y-1/2 top-1/2 left-3"
          />
        </span>
      </div>
      <input
        className="block w-full pl-8 pr-8 bg-transparent border-none outline-none focus:ring-0"
        name="search"
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e: React.ChangeEvent<HTMLInputElement>): void =>
          handleChange(e.target.value)
        }
      />
      {value !== '' && handleClear && (
        <div className="absolute inset-y-0 flex items-center pl-3 right-6">
          <button onClick={handleClear}>
            <span className="text-warm-gray-800 dark:text-white">
              <FontAwesomeIcon
                icon={faCircleXmark}
                size="lg"
                className="absolute transform -translate-y-1/2 top-1/2 left-3"
              />
            </span>
          </button>
        </div>
      )}
    </div>
  );
};
