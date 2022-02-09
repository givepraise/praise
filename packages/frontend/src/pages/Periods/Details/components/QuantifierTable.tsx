import { UserCell } from '@/components/table/UserCell';
import {
  PeriodQuantifiers,
  SinglePeriod,
  usePeriodPraiseQuery,
} from '@/model/periods';
import React from 'react';
import { useParams } from 'react-router-dom';
import { TableOptions, useTable } from 'react-table';
import { useRecoilValue } from 'recoil';

const QuantifierTable = () => {
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
  const { periodId } = useParams() as any;
  const period = useRecoilValue(SinglePeriod({ periodId }));
  usePeriodPraiseQuery(periodId);

  const periodQuantifiers = useRecoilValue(PeriodQuantifiers({ periodId }));

  const columns = React.useMemo(
    () => [
      {
        Header: 'Quantifier',
        accessor: 'userId',
        Cell: (data: any) => <UserCell userId={data.value} />,
      },
      {
        Header: 'Finished items',
        accessor: '',
        Cell: (data: any) => {
          return data.row.original
            ? // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
              `${data.row.original.done} / ${data.row.original.count}` //TODO FIX
            : null;
        },
      },
    ],
    []
  );

  const options = {
    columns,
    data: periodQuantifiers ? periodQuantifiers : [],
  } as TableOptions<{}>;
  const tableInstance = useTable(options);
  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } =
    tableInstance;

  if (!period) return <div>Period not found.</div>;

  if (period.status === 'OPEN')
    return <div>No quantifiers have yet been assigned to this period.</div>;

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
          </tr> //TODO FIX
        ))}
      </thead>
      <tbody {...getTableBodyProps()}>
        {rows.map((row) => {
          prepareRow(row);
          return (
            // eslint-disable-next-line react/jsx-key
            <tr id="" {...row.getRowProps()}>
              {row.cells.map((cell) => {
                // eslint-disable-next-line react/jsx-key
                return <td {...cell.getCellProps()}>{cell.render('Cell')}</td>;
              })}
            </tr> //TODO FIX ID and KEY
          );
        })}
      </tbody>
    </table>
  );
};

export default QuantifierTable;
