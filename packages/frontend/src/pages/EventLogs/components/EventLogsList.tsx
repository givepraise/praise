import { faArrowLeft, faArrowRight } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Dispatch, SetStateAction } from 'react';
import { useRecoilValue } from 'recoil';
import { EventLog } from '@/pages/EventLogs/components/EventLog';
import {
  AllEventLogs,
  AllEventLogsQueryParameters,
} from '@/model/eventlog/eventlogs';
import { classNames } from '@/utils/index';

interface EventLogsTableProps {
  queryParameters: AllEventLogsQueryParameters;
  setPage: Dispatch<SetStateAction<number>>;
}

export const EventLogsList = ({
  queryParameters,
  setPage,
}: EventLogsTableProps): JSX.Element | null => {
  const data = useRecoilValue(AllEventLogs(queryParameters));

  if (!data) return null;

  return (
    <div className="w-full">
      <div className="w-full">
        {data.docs.map((eventlog, i) => (
          <EventLog
            eventlog={eventlog}
            className={'p-7 hover:bg-warm-gray-100 dark:hover:bg-slate-500'}
            key={i}
          />
        ))}
      </div>
      {(data.hasNextPage || data.hasPrevPage) && (
        <div className="flex justify-between w-full mt-5">
          <div className="mb-5 ml-5 text-left">
            {data.hasPrevPage && (
              <a
                className="cursor-pointer"
                onClick={(): void => setPage(queryParameters.page - 1)}
              >
                <FontAwesomeIcon
                  icon={faArrowLeft}
                  size="1x"
                  className="mr-2"
                />
                Previous
              </a>
            )}
          </div>

          <div className="mb-5 mr-5 text-right">
            {data.hasNextPage && (
              <a
                className="cursor-pointer"
                // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
                onClick={(): void => setPage(queryParameters.page + 1)}
              >
                Next
                <FontAwesomeIcon
                  icon={faArrowRight}
                  size="1x"
                  className="ml-2"
                />
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
