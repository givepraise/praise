/* eslint-disable react/jsx-key */
import React from 'react';
import { TableOptions, useSortBy, useTable } from 'react-table';
import { classNames } from '../../../../utils';
import { row } from '../../../../model/report/interfaces/report-row.interface';

type ReportsTableProps = {
  data: row[];
};

export const ReportsTable = ({ data }: ReportsTableProps): JSX.Element => {
  const columns = React.useMemo(
    () =>
      Object.keys(data[0]).map((key) => ({
        Header: key,
        accessor: key,
        className: 'pl-5 text-left',
      })),
    [data]
  );

  const options = {
    columns,
    data: data || [],
  } as TableOptions<{}>;
  const tableInstance = useTable(options, useSortBy);

  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } =
    tableInstance;

  if (!Array.isArray(data) || data.length === 0)
    return (
      <div className="px-5">No data available. Please check back later.</div>
    );

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full table-auto" {...getTableProps()}>
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
                className={classNames(
                  row.values.status === 'CLOSED' ? 'text-warm-gray-400' : '',
                  'px-5 cursor-pointer hover:bg-warm-gray-100 dark:hover:bg-slate-500'
                )}
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
    </div>
  );
};
