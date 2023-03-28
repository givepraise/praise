/* eslint-disable react/jsx-key */
import React from 'react';
import { TableOptions, useSortBy, useTable } from 'react-table';
import { useRecoilValue } from 'recoil';
import { classNames } from '@/utils/index';
import { DATE_FORMAT, formatIsoDateUTC } from '@/utils/date';
import { AllApiKeys } from '@/model/apikeys/apikeys';
import { InlineLabel } from '@/components/ui/InlineLabel';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBackspace } from '@fortawesome/free-solid-svg-icons';
import Button from '@mui/material/Button';

export const ApplicationSettingsApiKeyTable = (): JSX.Element => {
  const apiKeys = useRecoilValue(AllApiKeys);

  const columns = React.useMemo(
    () => [
      {
        Header: 'Key',
        accessor: 'description',
        className: 'pl-5 text-left',
      },
      {
        Header: 'Hash',
        accessor: 'hash',
        className: 'pl-5 text-left',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        Cell: (data: any): string => {
          return data.value.slice(0, 8);
        },
      },
      {
        Header: 'Created',
        accessor: 'createdAt',
        className: 'text-left',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        Cell: (data: any): string => {
          return formatIsoDateUTC(data.value, DATE_FORMAT);
        },
      },
      {
        Header: 'Access',
        accessor: 'role',
        className: 'text-right',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        Cell: (data: any): JSX.Element => {
          return (
            <div className="w-full text-right">
              <InlineLabel
                text={data.value === 'API_KEY_READ' ? 'Read' : 'Read/Write'}
                className="bg-themecolor-alt-1"
              />
            </div>
          );
        },
      },
      {
        Header: '',
        accessor: 'delete',
        className: 'pl-5 text-left',
        Cell: (): JSX.Element => {
          return (
            <Button>
              <FontAwesomeIcon
                icon={faBackspace}
                className="w-5 h-4 text-gray-500"
              />
            </Button>
          );
        },
      },
    ],
    []
  );

  const options = {
    columns,
    data: apiKeys,
    initialState: {
      sortBy: [
        {
          id: 'createdAt',
          desc: true,
        },
      ],
    },
  } as TableOptions<{}>;
  const tableInstance = useTable(options, useSortBy);

  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } =
    tableInstance;

  if (!Array.isArray(apiKeys) || apiKeys.length === 0)
    return <div className="px-5">Create your first API Key.</div>;

  return (
    <table
      id="periods-table"
      className="w-full table-auto"
      {...getTableProps()}
    >
      <thead>
        {headerGroups.map((headerGroup) => {
          const { key, ...restHeaderGroupProps } =
            headerGroup.getHeaderGroupProps();
          return (
            <tr className="px-5" key={key} {...restHeaderGroupProps}>
              {headerGroup.headers.map((column) => {
                const { key, ...restColumn } = column.getHeaderProps();
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const className = (column as any).className as string;
                return (
                  <th
                    className={classNames(className, 'pb-2')}
                    key={key}
                    {...restColumn}
                  >
                    {column.render('Header')}
                  </th>
                );
              })}
            </tr>
          );
        })}
      </thead>
      <tbody {...getTableBodyProps()}>
        {rows.map((row) => {
          prepareRow(row);
          const { key, ...restRowProps } = row.getRowProps();
          return (
            <tr
              className="px-5 cursor-pointer hover:bg-warm-gray-100 dark:hover:bg-slate-500"
              key={key}
              {...restRowProps}
            >
              {row.cells.map((cell) => {
                const { key, ...restCellProps } = cell.getCellProps();

                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const className = (cell.column as any).className as string;
                return (
                  <td
                    className={classNames(className, 'py-3')}
                    key={key}
                    {...restCellProps}
                  >
                    {cell.render('Cell')}
                  </td>
                );
              })}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};
