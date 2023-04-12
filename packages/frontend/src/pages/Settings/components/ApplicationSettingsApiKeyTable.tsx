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

type ApiKeyTableProps = {
  handleDelete: (deleteKeyID: string) => void;
};

export const ApplicationSettingsApiKeyTable = ({
  handleDelete,
}: ApiKeyTableProps): JSX.Element | null => {
  const apiKeys = useRecoilValue(AllApiKeys);

  const columns = React.useMemo(
    () => [
      {
        Header: 'Key',
        accessor: 'description',
        className: 'text-left',
      },
      {
        Header: 'Hash',
        accessor: 'hash',
        className: 'text-left',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        Cell: (data: any): string => {
          return data.value.slice(-8);
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
            <InlineLabel
              text={data.value === 'API_KEY_READ' ? 'Read' : 'Read/Write'}
              className="!mr-0 bg-themecolor-alt-1"
            />
          );
        },
      },
      {
        Header: '',
        accessor: '_id',
        className: 'text-right w-9',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        Cell: (data: any): JSX.Element => {
          return (
            <button
              onClick={(event): void => {
                event.stopPropagation();
                handleDelete(data.value);
              }}
              className="cursor-pointer text-warm-gray-400 group-hover:inline-block"
              title="Delete key"
              type="button"
            >
              <FontAwesomeIcon
                icon={faBackspace}
                size="1x"
                className="ml-2 hover:text-warm-gray-500 dark:hover:text-warm-gray-300"
              />
            </button>
          );
        },
      },
    ],
    [handleDelete]
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

  if (!Array.isArray(apiKeys) || apiKeys.length === 0) return null;

  return (
    <table
      id="periods-table"
      className="w-full mt-4 table-auto"
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
            <tr className="px-5" key={key} {...restRowProps}>
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
