/* eslint-disable react/jsx-key */
import { InlineLabel } from '@/components/InlineLabel';
import { UserAvatarAndName } from '@/components/user/UserAvatarAndName';
import { HasRole, ROLE_ADMIN } from '@/model/auth';
import { SinglePeriodByDate } from '@/model/periods';
import { PraisePageParams, useSinglePraiseQuery } from '@/model/praise';
import { classNames } from '@/utils/index';
import { localizeAndFormatIsoDate } from '@/utils/date';
import { faCheckCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';
import { useParams } from 'react-router-dom';
import { TableOptions, useTable } from 'react-table';
import { useRecoilValue } from 'recoil';

interface DuplicatePraiseLabelProps {
  praiseId: string;
}
const DuplicatePraiseLabel = ({
  praiseId,
}: DuplicatePraiseLabelProps): JSX.Element => {
  return (
    <InlineLabel
      onClick={(): void => {
        window.location.href = `/praise/${praiseId}`;
      }}
      text={`#${praiseId.slice(-4)}`}
      className="bg-gray-400"
    />
  );
};
const PraiseDetailTable = (): JSX.Element => {
  const { praiseId } = useParams<PraisePageParams>();
  const isAdmin = useRecoilValue(HasRole(ROLE_ADMIN));
  const praise = useSinglePraiseQuery(praiseId);
  const period = useRecoilValue(SinglePeriodByDate(praise?.createdAt));

  const columns = React.useMemo(
    () => [
      {
        Header: 'Quantifier',
        accessor: 'quantifier',
        className: 'text-left',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        Cell: (data: any) => (
          <UserAvatarAndName userId={data.value} avatarClassName="text-2xl" />
        ),
      },
      {
        Header: 'Date',
        accessor: 'updatedAt',
        className: 'text-left whitespace-nowrap',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        Cell: (data: any) => localizeAndFormatIsoDate(data.value),
      },
      {
        Header: 'Score',
        accessor: 'score',
        className: 'text-right',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        Cell: (data: any) =>
          data.row.original.scoreRealized === 0
            ? '-'
            : data.row.original.scoreRealized,
      },
      {
        Header: 'Dismissed',
        accessor: 'dismissed',
        className: 'text-center',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

  if (!period || period.status === 'OPEN')
    return <div>This praise has not been quantified yet.</div>;

  if (period.status === 'QUANTIFY' && !isAdmin)
    return <div>Praise scores are not visible during quantification.</div>;

  return (
    <table id="periods-table" className="w-full" {...getTableProps()}>
      <thead>
        {headerGroups.map((headerGroup, rowIndex) => (
          <tr {...headerGroup.getHeaderGroupProps()} key={`row-${rowIndex}`}>
            {headerGroup.headers.map((column, colIndex) => (
              <th
                {...column.getHeaderProps()}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                className={(column as any).className}
                key={`td-${rowIndex}-${colIndex}`}
              >
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
            <tr {...row.getRowProps()}>
              {row.cells.map((cell) => {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const className = (cell.column as any).className as string;
                return (
                  <td
                    {...cell.getCellProps()}
                    className={classNames(className, 'pt-5')}
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

export default PraiseDetailTable;
