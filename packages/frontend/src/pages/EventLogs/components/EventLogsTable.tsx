import { formatIsoDateUTC, DATE_FORMAT_LONG } from '@/utils/date';

import { useState, useMemo } from 'react';
import { TableOptions, useTable } from 'react-table';
import { useAllEventLogs } from '@/model/eventlogs';

const EventLogsTable = (): JSX.Element | null => {
  const [page, setPage] = useState<number>(1);
  const { data } = useAllEventLogs({
    sortColumn: 'createdAt',
    sortType: 'desc',
    limit: 15,
    page,
  });

  const columns = useMemo(
    () => [
      {
        Header: 'Event Type',
        accessor: 'type',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        Cell: (data: any): JSX.Element => (
          <span title={data.value.description}>{data.value.label}</span>
        ),
      },
      {
        Header: 'User',
        accessor: 'user',
      },
      {
        Header: 'User Account',
        accessor: 'useraccount',
      },
      {
        Header: 'Date',
        accessor: 'createdAt',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        Cell: (data: any): string =>
          formatIsoDateUTC(data.value, DATE_FORMAT_LONG),
      },
      {
        Header: 'Description',
        accessor: 'description',
      },
    ],
    []
  );

  const options = {
    columns,
    data: data.docs,
  } as unknown as TableOptions<{}>;
  const tableInstance = useTable(options);
  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } =
    tableInstance;

  if (data.docs.length === 0) return null;

  return (
    <div>
      <table className="w-full table-auto" {...getTableProps()}>
        <thead>
          {headerGroups.map((headerGroup) => (
            // eslint-disable-next-line react/jsx-key
            <tr {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map((column) => (
                // eslint-disable-next-line react/jsx-key
                <th className="text-left" {...column.getHeaderProps()}>
                  {column.render('Header')}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody {...getTableBodyProps()}>
          {rows.map((row, i) => {
            prepareRow(row);
            return (
              // eslint-disable-next-line react/jsx-key
              <tr {...row.getRowProps()}>
                {row.cells.map((cell) => (
                  // eslint-disable-next-line react/jsx-key
                  <td
                    className={`${i % 2 !== 0 && 'bg-gray-100'}`}
                    {...cell.getCellProps()}
                  >
                    {cell.render('Cell')}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
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
