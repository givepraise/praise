/* eslint-disable react/jsx-key */
import React from 'react';
import { useParams } from 'react-router-dom';
import { TableOptions, useTable } from 'react-table';
import { useRecoilValue } from 'recoil';
import sortBy from 'lodash/sortBy';
import { PeriodPageParams, SinglePeriod } from '@/model/periods';
import Notice from '@/components/Notice';
import { classNames } from '@/utils/index';
import { UserAvatarAndName } from '@/components/user/UserAvatarAndName';

const QuantifierTable = (): JSX.Element => {
  const { periodId } = useParams<PeriodPageParams>();
  const period = useRecoilValue(SinglePeriod(periodId));

  const columns = React.useMemo(
    () => [
      {
        Header: 'Quantifier',
        accessor: '_id',
        className: 'text-left pl-5',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        Cell: (data: any): JSX.Element => (
          <UserAvatarAndName
            userId={data.row.original._id}
            avatarClassName="text-2xl"
          />
        ),
      },
      {
        Header: 'Finished items',
        accessor: '',
        className: 'text-right pr-5',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        Cell: (data: any): JSX.Element => (
          <div>
            {`${data.row.original.finishedCount} / ${data.row.original.praiseCount}`}
          </div>
        ),
      },
    ],
    []
  );

  const data = period?.quantifiers
    ? sortBy(period.quantifiers, [
        // First, sort by amount of praise remaining
        (quantifier): number => {
          return -1 * (quantifier.finishedCount / quantifier.praiseCount);
        },

        // Then by quantifier _id
        (quantifier): string => quantifier._id.toString(),
      ])
    : [];

  const options = {
    columns,
    data,
  } as TableOptions<{}>;
  const tableInstance = useTable(options);
  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } =
    tableInstance;

  if (!period) return <div>Period not found.</div>;

  if (period.status === 'OPEN')
    return (
      <div className="flex items-center justify-center w-full h-full">
        No quantifiers have been assigned for this period.
      </div>
    );

  if (period?.receivers?.length === 0)
    return (
      <div className="flex items-center w-full h-full">
        <Notice type="danger">
          <span>No quantifiers found in this period</span>
        </Notice>
      </div>
    );

  return (
    <table
      id="periods-table"
      className="w-full table-auto"
      {...getTableProps()}
    >
      <thead>
        {headerGroups.map((headerGroup) => (
          <tr {...headerGroup.getHeaderGroupProps()}>
            {headerGroup.headers.map((column) => {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const className = (column as any).className as string;
              return (
                <th
                  {...column.getHeaderProps()}
                  className={classNames(className, 'pb-2')}
                >
                  {column.render('Header')}
                </th>
              );
            })}
          </tr>
        ))}
      </thead>
      <tbody {...getTableBodyProps()}>
        {rows.map((row) => {
          prepareRow(row);
          return (
            <tr id="" {...row.getRowProps()}>
              {row.cells.map((cell) => {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const className = (cell.column as any).className as string;
                return (
                  <td
                    {...cell.getCellProps()}
                    className={classNames(className, 'py-3')}
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

export default QuantifierTable;
