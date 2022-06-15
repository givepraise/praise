import { useState } from 'react';
import { useAllEventLogs } from '@/model/eventlogs';
import EventLog from '@/components/eventlog/EventLog';
import { faArrowLeft, faArrowRight } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const EventLogsTable = (): JSX.Element | null => {
  const [page, setPage] = useState<number>(1);
  const { data } = useAllEventLogs({
    sortColumn: 'createdAt',
    sortType: 'desc',
    limit: 15,
    page,
  });

  if (data.docs.length === 0) return null;

  return (
    <div className="praise-box px-0">
      <div className="w-full">
        {data.docs.map((eventlog, i) => (
          <EventLog
            eventlog={eventlog}
            className={`${i % 2 === 0 && 'bg-gray-100 dark:bg-slate-500'} px-7`}
            key={i}
          />
        ))}
      </div>
      {(data.hasNextPage || data.hasPrevPage) && (
        <div className="w-full flex justify-between space-x-4 mt-4">
          <div>
            {data.hasPrevPage && (
              <a
                className="cursor-pointer"
                onClick={(): void => setPage(page - 1)}
              >
                <FontAwesomeIcon
                  icon={faArrowLeft}
                  size="1x"
                  className="mr-2 pl-5"
                />
                Previous
              </a>
            )}
          </div>

          <div>
            {data.hasNextPage && (
              <a
                className="cursor-pointer"
                onClick={(): void => setPage(page + 1)}
              >
                Next
                <FontAwesomeIcon
                  icon={faArrowRight}
                  size="1x"
                  className="ml-2 pr-5"
                />
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default EventLogsTable;
