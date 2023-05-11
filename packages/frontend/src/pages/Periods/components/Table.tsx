/* eslint-disable react/jsx-key */
import React from 'react';
import { useHistory } from 'react-router-dom';
import { TableOptions, useSortBy, useTable } from 'react-table';
import { useRecoilValue } from 'recoil';
import { classNames } from '@/utils/index';
import { DATE_FORMAT, formatIsoDateUTC } from '@/utils/date';
import { AllPeriods } from '@/model/periods/periods';
import { InlineLabel } from '@/components/ui/InlineLabel';
import { PeriodDetailsDto } from '@/model/periods/dto/period-details.dto';

export const PeriodsTable = (): JSX.Element => {
  const allPeriods = useRecoilValue(AllPeriods);
  const history = useHistory();

  const columns = React.useMemo(
    () => [
      {
        Header: 'Period',
        accessor: 'name',
        className: 'pl-5 text-left',
      },
      {
        Header: 'End date',
        accessor: 'endDate',
        className: 'text-left',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        Cell: (data: any): JSX.Element => {
          return (
            <div className="px-3 whitespace-nowrap">
              {formatIsoDateUTC(data.value, DATE_FORMAT)}
            </div>
          );
        },
      },
      {
        Header: '',
        accessor: 'status',
        className: 'pr-5',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        Cell: (data: any): JSX.Element => {
          return (
            <div className="w-full text-right">
              <InlineLabel
                text={data.value}
                className={
                  data.value === 'OPEN'
                    ? 'bg-themecolor-alt-1/50'
                    : data.value === 'QUANTIFY'
                    ? 'bg-themecolor-alt-1'
                    : 'bg-themecolor-alt-1/30'
                }
              />
            </div>
          );
        },
      },
    ],
    []
  );

  const options = {
    columns,
    data: allPeriods,
    initialState: {
      sortBy: [
        {
          id: 'endDate',
          desc: true,
        },
      ],
    },
  } as TableOptions<{}>;
  const tableInstance = useTable(options, useSortBy);

  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } =
    tableInstance;

  if (!Array.isArray(allPeriods) || allPeriods.length === 0)
    return (
      <div className="px-5">
        Create your first period to get started quantifying.
      </div>
    );

  const handleClick = (periodId: string) => (): void => {
    history.push(`/periods/${periodId}/receivers`);
  };
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
              className={classNames(
                row.values.status === 'CLOSED' ? 'text-warm-gray-400' : '',
                'px-5 cursor-pointer hover:bg-warm-gray-100 dark:hover:bg-slate-500'
              )}
              onClick={handleClick((row.original as PeriodDetailsDto)._id)}
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
