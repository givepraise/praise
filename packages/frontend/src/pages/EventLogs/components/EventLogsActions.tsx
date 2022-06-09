import MultiselectInput from '@/components/form/MultiselectInput';
import SearchInput from '@/components/form/SearchInput';
import SelectInput from '@/components/form/SelectInput';
import {
  eventLogsQueryParameters,
  useAllEventLogTypes,
} from '@/model/eventlogs';
import { debounce } from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import { useRecoilState } from 'recoil';

const sortOptions = [
  { value: 'desc', label: 'Newest' },
  { value: 'asc', label: 'Oldest' },
];

interface filterOptionsProps {
  key: string;
  label: string;
}

interface sortOptionsProps {
  value: string;
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

  const { types } = useAllEventLogTypes();
  const filterOptions = types.docs;

  const [queryParameters, setQueryParameters] = useRecoilState(
    eventLogsQueryParameters
  );

  const returnValues = useMemo(
    () =>
      debounce((data) => {
        const params = {
          ...queryParameters,
          ...{ sortType: data.selectedSort.value },
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
      }, 600),
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
      <MultiselectInput
        handleChange={setSelectedFilters}
        selected={selectedFilters}
        options={filterOptions}
      />

      {/* Search */}
      <SearchInput handleChange={setSearchValue} value={searchValue} />

      {/* Sort */}
      <div className="ml-auto">
        <SelectInput
          handleChange={setSelectedSort}
          selected={selectedSort}
          options={sortOptions}
        />
      </div>
    </div>
  );
};

export default EventLogsActions;
