import {
  eventLogsQueryParameters,
  useAllEventTypeLogs,
} from '@/model/eventlogs';
import { faFilter, faSearch } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Listbox, Transition } from '@headlessui/react';
import { debounce } from '@mui/material';
import { Fragment, useEffect, useMemo, useState } from 'react';
import { CheckmarkIcon } from 'react-hot-toast';
import { useRecoilState } from 'recoil';

const sortOptions = [
  { id: 'desc', label: 'Newest' },
  { id: 'asc', label: 'Oldest' },
];

interface filterOptionsProps {
  id: number;
  label: string;
}

interface sortOptionsProps {
  id: string;
  label: string;
}

const EventLogsActions = (): JSX.Element => {
  const [selectedFilters, setSelectedFilters] = useState<filterOptionsProps[]>(
    []
  );
  const [selectedSort, setSelectedSort] = useState<sortOptionsProps>(
    sortOptions[0]
  );
  const [searchValue, setSearchValue] = useState<string>('');

  const { types } = useAllEventTypeLogs();
  const filterOptions = types.docs;

  const [queryParameters, setQueryParameters] = useRecoilState(
    eventLogsQueryParameters
  );

  const returnValues = useMemo(
    () =>
      debounce((data) => {
        const params = {
          ...queryParameters,
          ...{ sortType: data.selectedSort.id },
          ...{
            type: Array.prototype.map
              .call(data.selectedFilters, (s) => s.key)
              .toString(),
          },
          ...{
            search: data.searchValue,
          },
        };

        setQueryParameters(params);
      }, 800),
    []
  );

  useEffect(() => {
    returnValues({
      selectedFilters: selectedFilters,
      selectedSort: selectedSort,
      searchValue: searchValue,
    });
  }, [selectedFilters, selectedSort, searchValue, returnValues]);

  return (
    <div className="flex mb-8">
      {/* Filter */}
      <div className="relative w-40">
        <Listbox value={selectedFilters} onChange={setSelectedFilters} multiple>
          <Listbox.Button className="border border-gray-300 w-full py-1.5 h-8 pl-3 pr-10 text-left bg-white text-xs">
            <span className="block truncate">
              {selectedFilters
                .map((filter) => (filter && filter.label ? filter.label : ''))
                .join(', ')}
            </span>

            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
              <span className="text-gray-800 xs:text-xs">
                <FontAwesomeIcon icon={faFilter} />
              </span>
            </div>
          </Listbox.Button>
          <Transition
            as={Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Listbox.Options className="absolute mt-1 max-h-60 w-full overflow-auto bg-white py-1 border border-gray-300 text-xs">
              {filterOptions.map((filter, filterIdx) => (
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
                      {selected ? (
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-600">
                          <CheckmarkIcon
                            className="h-5 w-5"
                            aria-hidden="true"
                          />
                        </span>
                      ) : null}
                    </>
                  )}
                </Listbox.Option>
              ))}
            </Listbox.Options>
          </Transition>
        </Listbox>
      </div>

      {/* Search */}
      <div className="relative ml-6">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3">
          <span className="text-gray-800 xs:text-xs">
            <FontAwesomeIcon icon={faSearch} />
          </span>
        </div>
        <input
          className="pl-8 text-xs w-40 border border-gray-300 h-8"
          name="search"
          type="text"
          placeholder="Search"
          value={searchValue}
          onChange={(e): void => setSearchValue(e.target.value)}
        />
      </div>

      {/* Sort */}
      <div className="relative w-40 ml-auto">
        <Listbox value={selectedSort} onChange={setSelectedSort}>
          <Listbox.Button className="border border-gray-300 w-full py-1.5 h-8 pl-3 pr-10 text-left bg-white text-xs">
            <span className="block truncate">{selectedSort.label}</span>
            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
              <span className="text-gray-800 xs:text-xs">
                <FontAwesomeIcon icon={faFilter} />
              </span>
            </div>
          </Listbox.Button>
          <Transition
            as={Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Listbox.Options className="absolute mt-1 max-h-60 w-full overflow-auto bg-white py-1 border border-gray-300 text-xs">
              {sortOptions.map((s, sIdx) => (
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
    </div>
  );
};

export default EventLogsActions;
