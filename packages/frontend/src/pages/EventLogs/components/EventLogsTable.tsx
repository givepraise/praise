import { AllPeriods } from '@/model/periods';
import { formatIsoDateUTC } from '@/utils/date';
import { classNames } from '@/utils/index';
import { PeriodDto } from 'api/dist/period/types';
import React, { useState, useMemo, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { TableOptions, useTable } from 'react-table';
import { useRecoilValue } from 'recoil';
import { useAllEventLogs } from '@/model/eventlogs';
import { makeApiAuthClient } from '@/utils/api';
import { EventLogDto } from 'api/dist/eventlog/types';

const EventLogsTable = (): JSX.Element | null => {
  const [page, setPage] = useState<number>(0);
  const { data, loading } = useAllEventLogs({ limit: 100, page });

  const columns = useMemo(
    () => [
      {
        Header: 'Event Type',
        accessor: 'type',
      },
      {
        Header: 'User',
        accessor: 'user',
      },
      {
        Header: 'Date',
        accessor: 'createdAt',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        Cell: (data: any): string => formatIsoDateUTC(data.value),
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
        {rows.map((row) => {
          prepareRow(row);
          return (
            // eslint-disable-next-line react/jsx-key
            <tr {...row.getRowProps()}>
              {row.cells.map((cell) => {
                // eslint-disable-next-line react/jsx-key
                return <td {...cell.getCellProps()}>{cell.render('Cell')}</td>;
              })}
            </tr>
          );
        })}
      </tbody>
      <div>
        <a onClick={(): void => setPage(page - 1)}>Previous</a>
        <a onClick={(): void => setPage(page + 1)}>Next</a>
      </div>
    </table>
  );
};

export default EventLogsTable;
