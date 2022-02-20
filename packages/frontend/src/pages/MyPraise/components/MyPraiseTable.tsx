import LoaderSpinner from '@/components/LoaderSpinner';
import { UserAvatar } from '@/components/user/UserAvatar';
import { AllPraiseList } from '@/model/praise';
import { formatDate } from '@/utils/date';
import { faSadTear } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { PraiseDto } from 'api/dist/praise/types';
import React, { SyntheticEvent } from 'react';
import { useHistory } from 'react-router-dom';
import { TableOptions, useTable } from 'react-table';
import { useRecoilValue } from 'recoil';
import MyPraisePageLoader from './MyPraisePageLoader';

export const MY_PRAISE_LIST_KEY = 'MY_PRAISE';

const MyPraiseTable = () => {
  const history = useHistory();
  const allPraise = useRecoilValue(AllPraiseList(MY_PRAISE_LIST_KEY));
  const columns = React.useMemo(
    () => [
      {
        accessor: 'createdAt',
        Cell: (data: any) => (
          <div className="flex items-center w-full">
            <div className="flex items-center">
              <UserAvatar userAccount={data.row.original.giver} />
            </div>
            <div className="flex-grow p-3 overflow-hidden">
              <div>
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

  const handleClick = (data: PraiseDto) => (e: SyntheticEvent) => {
    history.push(`/praise/${data._id}`);
  };

  return (
    <>
      {' '}
      {allPraise ? (
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
                      <td {...cell.getCellProps()}>{cell.render('Cell')}</td> //TODO add key
                    );
                  })}
                </tr> //TODO Add key
              );
            })}
          </tbody>
        </table>
      ) : (
        <div>
          {' '}
          <FontAwesomeIcon icon={faSadTear} size="2x" className="mr-2" />
          <div className="mt-3">You have not yet received any praise.</div>
        </div>
      )}
      <React.Suspense fallback={<LoaderSpinner />}>
        <MyPraisePageLoader />
      </React.Suspense>
    </>
  );
};

export default MyPraiseTable;
