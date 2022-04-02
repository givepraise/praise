import LoaderSpinner from '@/components/LoaderSpinner';
import { ForwarderTooltip } from '@/components/praise/ForwarderTooltip';
import { UserAvatar } from '@/components/user/UserAvatar';
import { AllPraiseListLocalized } from '@/model/praise';
import { formatDate } from '@/utils/date';
import { PraiseDto } from 'api/dist/praise/types';
import React from 'react';
import { useHistory } from 'react-router-dom';
import { TableOptions, useTable } from 'react-table';
import { useRecoilValue } from 'recoil';
import PraisePageLoader from './PraisePageLoader';

export const ALL_PRAISE_LIST_KEY = 'ALL_PRAISE';

const PraiseTable = (): JSX.Element => {
  const history = useHistory();
  const allPraise = useRecoilValue(AllPraiseListLocalized(ALL_PRAISE_LIST_KEY));
  const columns = React.useMemo(
    () => [
      {
        accessor: 'createdAt',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        Cell: (data: any) => (
          <div className="flex items-center w-full">
            <div className="flex items-center">
              <UserAvatar userAccount={data.row.original.giver} />
            </div>
            <div className="flex-grow p-3 overflow-hidden">
              <div>
                <ForwarderTooltip praise={data.row.original} />
                <span className="font-bold">
                  {data.row.original.giver.name}
                </span>{' '}
                to{' '}
                <span className="font-bold">
                  {data.row.original.receiver.name}
                </span>
                <span className="ml-2 text-xs text-gray-500">
                  {formatDate(data.row.original.createdAt)}
                </span>
              </div>

              <div className="w-full">{data.row.original.reason}</div>
            </div>
          </div>
        ),
      },
    ],
    []
  );

  const options = {
    columns,
    data: allPraise ? allPraise : [],
  } as TableOptions<{}>;
  const tableInstance = useTable(options);

  const { getTableProps, getTableBodyProps, rows, prepareRow } = tableInstance;

  const handleClick = (data: PraiseDto) => () => {
    history.push(`/praise/${data._id}`);
  };

  return (
    <>
      <table
        id="praises-table"
        className="w-full table-fixed"
        {...getTableProps()}
      >
        <tbody {...getTableBodyProps()}>
          {rows.map((row) => {
            prepareRow(row);
            return (
              // eslint-disable-next-line react/jsx-key
              <tr
                className="cursor-pointer hover:bg-gray-100"
                {...row.getRowProps()}
                onClick={handleClick(row.original as PraiseDto)}
              >
                {row.cells.map((cell) => {
                  return (
                    // eslint-disable-next-line react/jsx-key
                    <td {...cell.getCellProps()}>{cell.render('Cell')}</td> //TODO fix
                  );
                })}
              </tr> //TODO fix
            );
          })}
        </tbody>
      </table>
      <React.Suspense fallback={<LoaderSpinner />}>
        <PraisePageLoader />
      </React.Suspense>
    </>
  );
};

export default PraiseTable;
