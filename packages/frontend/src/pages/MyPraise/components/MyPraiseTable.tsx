import LoaderSpinner from '@/components/LoaderSpinner';
import { ForwarderTooltip } from '@/components/praise/ForwarderTooltip';
import { UserAvatar } from '@/components/user/UserAvatar';
import { AllPraiseList } from '@/model/praise';
import { localizeAndFormatIsoDate } from '@/utils/date';
import { faSadTear } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { PraiseDto } from 'api/dist/praise/types';
import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { TableOptions, useTable } from 'react-table';
import { useRecoilValue } from 'recoil';
import { ActiveUserId } from '@/model/auth';
import { SingleUser } from '@/model/users';
import { UserDto } from 'api/dist/user/types';
import PraisePageLoader from '../../Start/components/PraisePageLoader';

export const MY_PRAISE_LIST_KEY = 'MY_PRAISE';

//TODO add support for more than one user account connected to one user
const getReceiverId = (user: UserDto | undefined): string | undefined => {
  const accounts = user?.accounts;
  return Array.isArray(accounts) && accounts.length > 0
    ? accounts[0]._id
    : undefined;
};

const MyPraiseTable = (): JSX.Element => {
  const history = useHistory();
  const allPraise = useRecoilValue(AllPraiseList(MY_PRAISE_LIST_KEY));
  const userId = useRecoilValue(ActiveUserId);
  const user = useRecoilValue(SingleUser({ userId }));
  const [receiverId, setReceiverId] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (!user) return;

    setReceiverId(getReceiverId(user));
  }, [user]);

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
                  {localizeAndFormatIsoDate(data.row.original.createdAt)}
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
                      <td {...cell.getCellProps()}>{cell.render('Cell')}</td>
                    );
                  })}
                </tr>
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
        {receiverId && (
          <PraisePageLoader
            listKey={MY_PRAISE_LIST_KEY}
            receiverId={receiverId}
          />
        )}
      </React.Suspense>
    </>
  );
};

export default MyPraiseTable;
