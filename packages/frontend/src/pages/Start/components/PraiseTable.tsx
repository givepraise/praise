import LoaderSpinner from '@/components/LoaderSpinner';
import { ForwarderTooltip } from '@/components/praise/ForwarderTooltip';
import { UserAvatar } from '@/components/user/UserAvatar';
import { AllPraiseList } from '@/model/praise';
import { formatDate } from '@/utils/date';
import { PraiseDto } from 'api/dist/praise/types';
import React from 'react';
import { useHistory } from 'react-router-dom';
import { TableOptions, useTable } from 'react-table';
import { useRecoilValue } from 'recoil';
import PraisePageLoader from './PraisePageLoader';
import { micromark } from 'micromark';
import { unfurl } from 'unfurl.js';
import Metascraper from 'metascraper';
import { LinkPreview } from '@dhaiwat10/react-link-preview';

export const ALL_PRAISE_LIST_KEY = 'ALL_PRAISE';

const PraiseTable = (): JSX.Element => {
  const history = useHistory();
  const allPraise = useRecoilValue(AllPraiseList(ALL_PRAISE_LIST_KEY));

  const getEmbedLink = async (text) => {
    // const result = unfurl('https://github.com/trending');
    // console.log('UNFURL:', result);
  };

  const columns = React.useMemo(
    () => [
      {
        accessor: 'createdAt',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        Cell: (data: any) => (
          <div className="flex items-top w-full">
            <div className="flex items-top mt-2">
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

              <div className="w-full">
                <LinkPreview url="https://github.com/nebs-dev" width="400px" />{' '}
              </div>
            </div>

            {/* <iframe
              src="https://dnevnik.hr/showbuzz/celebrity/izabel-goulart-u-bikiniju-s-tangama-izvijala-se-pod-tusem-na-plazi---718391.html?itm_source=HomeTopRow&itm_medium=Dnevnik&itm_campaign=Naslovnica"
              height="300"
              width="300"
            /> */}
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
