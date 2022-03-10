import { UserCell } from '@/components/table/UserCell';
import { HasRole, ROLE_ADMIN } from '@/model/auth';
import { PeriodPageParams, SinglePeriod } from '@/model/periods';
import React from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { TableOptions, useSortBy, useTable } from 'react-table';
import { useRecoilValue } from 'recoil';

const ReceiverTable = (): JSX.Element | null => {
  const { periodId } = useParams<PeriodPageParams>();
  const isAdmin = useRecoilValue(HasRole(ROLE_ADMIN));
  const period = useRecoilValue(SinglePeriod(periodId));

  const ReceiverTableInner = (): JSX.Element => {
    const history = useHistory();

    const columns = React.useMemo(
      () => [
        {
          Header: 'Receiver',
          accessor: '_id',
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          Cell: (data: any): JSX.Element => (
            <UserCell userId={data.row.original.userAccount.name} />
          ),
        },
        {
          Header: 'Number of praise',
          className: 'text-center',
          accessor: 'praiseCount',
        },
        {
          Header: 'Total praise score',
          className: 'text-center',
          accessor: 'score',
          sortType: 'basic',
        },
      ],
      []
    );

    const options = {
      columns,
      data: period?.receivers ? period.receivers : [],
      initialState: {
        sortBy: [
          {
            id: period?.status === 'OPEN' ? 'praiseCount' : 'praiseScore',
            desc: true,
          },
        ],
      },
    } as TableOptions<{}>;
    const tableInstance = useTable(options, useSortBy);

    const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } =
      tableInstance;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleClick = (data: any) => (): void => {
      history.push(`/period/${periodId}/receiver/${data._id}`);
    };

    return (
      <table
        id="periods-table"
        className="w-full table-auto"
        {...getTableProps()}
      >
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
              <tr
                className="cursor-pointer hover:bg-gray-100"
                {...row.getRowProps()}
                onClick={handleClick(row.original)}
              >
                {row.cells.map((cell) => {
                  return (
                    // eslint-disable-next-line react/jsx-key
                    <td
                      {...cell.getCellProps()}
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      className={(cell.column as any).className}
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
    return <div>Praise scores are not visible during quantification.</div>;

  if (period.receivers) return <ReceiverTableInner />;

  return null;
};

export default ReceiverTable;
