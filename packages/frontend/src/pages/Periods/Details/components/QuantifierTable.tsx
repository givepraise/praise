import { UserCell } from '@/components/table/UserCell';
import { isResponseOk } from '@/model/api';
import { SinglePeriodDetailsQuery } from '@/model/periods';
import { PeriodDetailsDto } from 'api/dist/period/types';
import React from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { TableOptions, useTable } from 'react-table';
import { useRecoilValue } from 'recoil';

const QuantifierTable = () => {
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
  const { periodId } = useParams() as any;
  const { location } = useHistory();
  const periodDetailsReponse = useRecoilValue(
    SinglePeriodDetailsQuery({ periodId, refreshKey: location.key })
  );

  const period: PeriodDetailsDto | null = isResponseOk(periodDetailsReponse)
    ? (periodDetailsReponse.data as PeriodDetailsDto)
    : null;

  const columns = React.useMemo(
    () => [
      {
        Header: 'Quantifier',
        accessor: '_id',
        className: 'text-left',
        Cell: (data: any): JSX.Element => (
          <UserCell userId={data.row.original._id} />
        ),
      },
      {
        Header: 'Finished items',
        accessor: '',
        className: 'text-center',
        Cell: (data: any): JSX.Element => (
          <div>
            {`${data.row.original.finishedCount} / ${data.row.original.praiseCount}`}
          </div>
        ),
      },
    ],
    []
  );

  const options = {
    columns,
    data: period ? period.quantifiers : [],
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
              <th
                {...column.getHeaderProps()}
                className={(column as any).className}
              >
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
            </tr> //TODO FIX ID and KEY
          );
        })}
      </tbody>
    </table>
  );
};

export default QuantifierTable;
