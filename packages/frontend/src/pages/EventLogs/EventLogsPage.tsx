import {
  faArrowDownWideShort,
  faBook,
} from '@fortawesome/free-solid-svg-icons';
import { Suspense, useEffect, useMemo, useState } from 'react';
import { debounce } from '@mui/material';
import { useRecoilValue } from 'recoil';
import { LoaderSpinner } from '@/components/ui/LoaderSpinner';
import { MultiselectInput } from '@/components/form/MultiselectInput';
import { SearchInput } from '@/components/form/SearchInput';
import { SelectInput } from '@/components/form/SelectInput';
import {
  AllEventLogsQueryParameters,
  AllEventLogTypes,
} from '@/model/eventlog/eventlogs';
import { BreadCrumb } from '@/components/ui/BreadCrumb';
import { Page } from '@/components/ui/Page';
import { Box } from '@/components/ui/Box';
import { EventLogsList } from './components/EventLogsList';

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

const defaultQueryParameters = {
  sortColumn: 'createdAt',
  sortType: 'desc',
  limit: 15,
  page: 1,
  types: '',
  search: '',
} as AllEventLogsQueryParameters;

const EventLogsPage = (): JSX.Element => {
  const [selectedFilters, setSelectedFilters] = useState<filterOptionsProps[]>(
    []
  );
  const [selectedSort, setSelectedSort] = useState<sortOptionsProps>(
    sortOptions[0]
  );
  const [searchValue, setSearchValue] = useState<string>('');

  const [page, setPage] = useState<number>(1);

  const eventLogtypes = useRecoilValue(AllEventLogTypes);

  const [queryParameters, setQueryParameters] = useState(
    defaultQueryParameters
  );

  const setLocalParameters = useMemo(
    () =>
      debounce((data) => {
        const params = {
          ...defaultQueryParameters,
          sortType: data.selectedSort.value,
          types: Array.prototype.map
            .call(data.selectedFilters, (s) => s.key)
            .toString(),
          search: data.searchValue,
          page: data.page,
        };

        setQueryParameters(params);
      }, 600),
    []
  );

  useEffect(() => {
    setLocalParameters({
      selectedFilters: selectedFilters,
      selectedSort: selectedSort,
      searchValue: searchValue,
      page: page,
    });
  }, [selectedFilters, selectedSort, searchValue, page, setLocalParameters]);

  return (
    <Page>
      <BreadCrumb name="Transparency Log" icon={faBook} />

      <Box className="mb-5">
        <h2 className="mb-2">Transparency Log</h2>
        <p>A log of all user actions that change the database state.</p>
      </Box>

      <Box className="!p-0">
        <div className="flex mb-8">
          {/* Filter */}
          <div className="w-3/12 mt-5 mb-5 ml-5 mr-4">
            {eventLogtypes && (
              <MultiselectInput
                handleChange={(e): void => {
                  setSelectedFilters(e);
                  setPage(1);
                }}
                selected={selectedFilters}
                options={eventLogtypes}
                noSelectedMessage="All log items"
              />
            )}
          </div>

          {/* Search */}
          <div className="w-5/12 mt-5 mb-5 mr-4">
            <SearchInput
              handleChange={(e): void => {
                setSearchValue(e);
                setPage(1);
              }}
              value={searchValue}
              handleClear={(): void => setSearchValue('')}
            />
          </div>

          {/* Sort */}
          <div className="w-2/12 mt-5 mb-5 ml-auto mr-5">
            <SelectInput
              handleChange={(e): void => {
                setSelectedSort(e);
                setPage(1);
              }}
              selected={selectedSort}
              options={sortOptions}
              icon={faArrowDownWideShort}
            />
          </div>
        </div>

        <Suspense fallback={<LoaderSpinner />}>
          <EventLogsList queryParameters={queryParameters} setPage={setPage} />
        </Suspense>
      </Box>
    </Page>
  );
};

// eslint-disable-next-line import/no-default-export
export default EventLogsPage;
