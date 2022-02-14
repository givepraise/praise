import { HasRole, ROLE_ADMIN } from '@/model/auth';
import {
  AllPeriodReceivers,
  ReceiverData,
  SinglePeriod,
  usePeriodPraiseQuery,
} from '@/model/periods';
import React, { SyntheticEvent } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { TableOptions, useSortBy, useTable } from 'react-table';
import { useRecoilValue } from 'recoil';

const ReceiverTable = () => {
  const history = useHistory();
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
  const { periodId } = useParams() as any;
  const period = useRecoilValue(SinglePeriod({ periodId }));
  const isAdmin = useRecoilValue(HasRole(ROLE_ADMIN));
  usePeriodPraiseQuery(periodId);
  const periodReceivers = useRecoilValue(AllPeriodReceivers({ periodId }));

  const columns = React.useMemo(
    () => [
      {
        Header: 'Receiver',
        accessor: 'username',
      },
      {
        Header: 'Number of praise',
        accessor: 'praiseCount',
      },
      {
        Header: 'Total praise score',
        accessor: 'praiseScore',
        sortType: 'basic',
      },
    ],
    []
  );

  const options = {
    columns,
    data: periodReceivers ? periodReceivers : [],
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

  const handleClick = (data: ReceiverData) => (e: SyntheticEvent) => {
    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    history.push(`/period/${periodId}/receiver/${data.receiverId}`);
  };

  if (!period) return <div>Period not found.</div>;

  if (period.status === 'QUANTIFY' && !isAdmin)
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
          </tr> // TODO FIX
        ))}
      </thead>
      <tbody {...getTableBodyProps()}>
        {rows.map((row) => {
          prepareRow(row);
          return (
            // eslint-disable-next-line react/jsx-key
            <tr
              className="cursor-pointer hover:bg-gray-100"
              id=""
              {...row.getRowProps()}
              onClick={handleClick(row.original as ReceiverData)}
            >
              {row.cells.map((cell) => {
                // eslint-disable-next-line react/jsx-key
                return <td {...cell.getCellProps()}>{cell.render('Cell')}</td>;
              })}
            </tr> // TODO fix id and key
          );
        })}
      </tbody>
    </table>
  );
};

export default ReceiverTable;
