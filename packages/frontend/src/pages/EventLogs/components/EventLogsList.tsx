import { formatIsoDateUTC, DATE_FORMAT_LONG } from '@/utils/date';

import { useState, useMemo } from 'react';
import { TableOptions, useTable } from 'react-table';
import { useAllEventLogs } from '@/model/eventlogs';
import { EventLogTypeKey } from 'api/dist/eventlog/types';

const eventLogTypeColors = {
  [EventLogTypeKey.PERMISSION]: 'bg-orange-200',
  [EventLogTypeKey.AUTHENTICATION]: 'bg-red-200',
  [EventLogTypeKey.PERIOD]: 'bg-blue-200',
  [EventLogTypeKey.PRAISE]: 'bg-yellow-200',
  [EventLogTypeKey.QUANTIFICATION]: 'bg-green-200',
  [EventLogTypeKey.SETTING]: 'bg-indigo-200',
};

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
    <div>
      <div className="w-full space-y-4">
        {data.docs.map((eventlog, i) => (
          <div
            key={i}
            className={`flex justify-start items-center space-x-0 sm:space-x-8 space-y-4 sm:space-y-0 py-4 px-2 flex-wrap sm:flex-nowrap ${
              i % 2 !== 0 && 'bg-gray-100'
            }`}
          >
            <div className="space-y-0 sm:space-y-2 w-full sm:w-1/3 flex-grow-0">
              <div className="flex justify-center">
                <div
                  className={`inline-block px-2 py-1 text-xs text-gray-600 rounded-full ${
                    eventLogTypeColors[eventlog.type.key]
                  }`}
                  title={eventlog.type.description}
                >
                  {eventlog.type.label}
                </div>
              </div>
              <div>
                <div className="text-xs font-bold text-gray-600">Date</div>
                <code className="text-xs">
                  {formatIsoDateUTC(eventlog.createdAt, DATE_FORMAT_LONG)} UTC
                </code>
              </div>
              <div>
                <div className="text-xs font-bold text-gray-600">User</div>
                <code className="inset text-xs">{eventlog.user}</code>
              </div>
              {eventlog.useraccount && (
                <div>
                  <div className="text-xs font-bold text-gray-600">
                    User Account
                  </div>
                  <code className="inset text-xs">
                    {eventlog.useraccount.name}
                  </code>
                </div>
              )}
            </div>

            <div className="flex flex-col justify-center w-full flex-grow-1">
              <div>{eventlog.description}</div>
            </div>
          </div>
        ))}
      </div>
      <div className="w-full flex justify-end space-x-4 mt-4">
        {data.hasPrevPage && (
          <a className="cursor-pointer" onClick={(): void => setPage(page - 1)}>
            Previous
          </a>
        )}

        {data.hasNextPage && (
          <a className="cursor-pointer" onClick={(): void => setPage(page + 1)}>
            Next
          </a>
        )}
      </div>
    </div>
  );
};

export default EventLogsTable;
