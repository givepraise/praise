import { InlineLabel } from '@/components/InlineLabel';
import { UserCell } from '@/components/table/UserCell';
import { HasRole, ROLE_ADMIN } from '@/model/auth';
import { SinglePeriodByDate } from '@/model/periods';
import { useSinglePraiseQuery } from '@/model/praise';
import { formatDate } from '@/utils/date';
import { faCheckCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { TableOptions, useTable } from 'react-table';
import { useRecoilValue } from 'recoil';

interface DuplicatePraiseLabelProps {
  praiseId: string;
}
const DuplicatePraiseLabel = ({ praiseId }: DuplicatePraiseLabelProps) => {
  const history = useHistory();
  return (
    <InlineLabel
      onClick={() => {
        window.location.href = `/praise/${praiseId}`;
      }}
      text={`#${praiseId.slice(-4)}`}
      className="bg-gray-400"
    />
  );
};
const PraiseDetailTable = () => {
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
  const { praiseId } = useParams() as any;
  const isAdmin = useRecoilValue(HasRole(ROLE_ADMIN));
  const praise = useSinglePraiseQuery(praiseId);
  const period = useRecoilValue(SinglePeriodByDate(praise?.createdAt));

  const columns = React.useMemo(
    () => [
      {
        Header: 'Quantifier',
        accessor: 'quantifier',
        className: 'text-left',
        Cell: (data: any) => <UserCell userId={data.value} />,
      },
      {
        Header: 'Date',
        accessor: 'updatedAt',
        className: 'text-left',
        Cell: (data: any) => formatDate(data.value),
      },
      {
        Header: 'Score',
        accessor: 'score',
        className: 'text-center',
        Cell: (data: any) =>
          data.row.original.duplicatePraise
            ? data.row.original.duplicateScore
              ? data.row.original.duplicateScore
              : '–'
            : data.row.original.score === 0
            ? '–'
            : data.row.original.score,
      },
      {
        Header: 'Dismissed',
        accessor: 'dismissed',
        className: 'text-center',
        Cell: (data: any) =>
          data.value === true ? (
            <FontAwesomeIcon icon={faCheckCircle} size="1x" />
          ) : (
            ''
          ),
      },
      {
        Header: 'Duplicate',
        accessor: 'duplicatePraise',
        className: 'text-center',
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        Cell: (data: any) =>
          data.value ? <DuplicatePraiseLabel praiseId={data.value} /> : '',
      },
    ],
    []
  );

  const options = {
    columns,
    data: praise ? praise.quantifications : [],
  } as TableOptions<{}>;
  const tableInstance = useTable(options);

  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } =
    tableInstance;

  if (!period) return <div>Could not load praise details.</div>;

  if (period.status === 'QUANTIFY' && !isAdmin)
    return <div>Praise scores are not visible during quantification.</div>;

  if (period.status === 'OPEN')
    return <div>This praise has not been quantified yet.</div>;

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
          </tr> //TODO fix
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
            </tr> //TODO fix key and id
          );
        })}
      </tbody>
    </table>
  );
};

export default PraiseDetailTable;
