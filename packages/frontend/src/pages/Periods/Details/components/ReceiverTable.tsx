import { UserCell } from '@/components/table/UserCell';
import { HasRole, ROLE_ADMIN } from '@/model/auth';
import { useSinglePeriodQuery } from '@/model/periods';
import React, { SyntheticEvent } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { TableOptions, useSortBy, useTable } from 'react-table';
import { useRecoilValue } from 'recoil';

const ReceiverTable = () => {
  const history = useHistory();
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
  const { periodId } = useParams() as any;
  const isAdmin = useRecoilValue(HasRole(ROLE_ADMIN));
  const { location } = useHistory();
  const periodDetails = useSinglePeriodQuery(periodId, location.key);

  const columns = React.useMemo(
    () => [
      {
        Header: 'Receiver',
        accessor: '_id',
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
    data: periodDetails?.receivers ? periodDetails.receivers : [],
    initialState: {
      sortBy: [
        {
          id: periodDetails?.status === 'OPEN' ? 'praiseCount' : 'praiseScore',
          desc: true,
        },
      ],
    },
  } as TableOptions<{}>;
  const tableInstance = useTable(options, useSortBy);

  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } =
    tableInstance;

  const handleClick = (data: any) => (e: SyntheticEvent) => {
    history.push(`/period/${periodId}/receiver/${data._id}`);
  };

  if (!periodDetails) return <div>Period not found.</div>;

  if (periodDetails.status === 'QUANTIFY' && !isAdmin)
    return <div>Praise scores are not visible during quantification.</div>;

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

export default ReceiverTable;
