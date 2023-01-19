/* eslint-disable react/jsx-key */
import React from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { TableOptions, useSortBy, useTable } from 'react-table';
import { useRecoilValue } from 'recoil';
import sortBy from 'lodash/sortBy';
import {
  PeriodPageParams,
  SinglePeriod,
  useLoadSinglePeriodDetails,
} from '@/model/periods/periods';
import { HasRole, ROLE_ADMIN } from '@/model/auth/auth';
import { Notice } from '@/components/ui/Notice';
import { classNames } from '@/utils/index';
import { UserAvatarAndName } from '@/components/user/UserAvatarAndName';
import { UserAccountDto } from '@/model/useraccount/useraccount.dto';

type GiverReceiverType = 'giver' | 'receiver';

interface Params {
  type: GiverReceiverType;
}

export const GiverReceiverTable = ({ type }: Params): JSX.Element | null => {
  const { periodId } = useParams<PeriodPageParams>();
  const isAdmin = useRecoilValue(HasRole(ROLE_ADMIN));
  useLoadSinglePeriodDetails(periodId);
  const period = useRecoilValue(SinglePeriod(periodId));
  const pluralType = `${type}s`;

  const TableInner = (): JSX.Element => {
    const history = useHistory();

    const columns = React.useMemo(
      () => [
        {
          Header: `${type.charAt(0).toUpperCase()}${type.slice(1)}`,
          accessor: '_id',
          className: 'text-left pl-5',
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          Cell: (data: any): JSX.Element => (
            <UserAvatarAndName
              userId={data.row.original.user}
              userAccount={data.row.original}
              avatarClassName="text-2xl"
            />
          ),
        },
        {
          Header: 'Praise Count',
          className: 'text-right',
          accessor: 'praiseCount',
        },
        {
          Header: 'Total Score',
          className: 'text-right pr-5',
          accessor: 'score',
          sortType: 'basic',
        },
      ],
      []
    );
    const data = period?.[pluralType]
      ? sortBy(period[pluralType], [
          // First, sort by user.score
          (userAccount): number => {
            if (!userAccount?.score) return 0;
            return userAccount.score;
          },

          // Then by user.name
          (user): string => user.name,
        ])
      : [];

    const options = {
      columns,
      data: data,
      initialState: {
        sortBy: [
          {
            id: period?.status === 'OPEN' ? 'praiseCount' : 'score',
            desc: true,
          },
        ],
      },
    } as TableOptions<UserAccountDto>;
    const tableInstance = useTable<UserAccountDto>(options, useSortBy);

    const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } =
      tableInstance;

    const handleClick = (data: UserAccountDto) => (): void => {
      history.push(`/periods/${periodId}/${type}/${data._id}`);
    };

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
                    className={classNames(className, 'pb-2')}
                    {...column.getHeaderProps()}
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
              <tr
                className="cursor-pointer hover:bg-warm-gray-100 dark:hover:bg-slate-500"
                {...row.getRowProps()}
                onClickCapture={handleClick(row.original)}
              >
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

  if (!period) return <div>Period not found.</div>;

  if (period.status === 'QUANTIFY' && !isAdmin)
    return (
      <div className="flex items-center w-full h-full">
        <Notice type="danger">
          <span>Praise scores are not visible during quantification.</span>
        </Notice>
      </div>
    );

  if (
    !period[pluralType] ||
    (Array.isArray(period[pluralType]) && period[pluralType].length) === 0
  )
    return (
      <div className="flex items-center justify-center w-full h-full">
        No {pluralType} found in this period.
      </div>
    );

  if (period[pluralType]) return <TableInner />;

  return null;
};
