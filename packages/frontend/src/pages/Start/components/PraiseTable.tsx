import LoaderSpinner from '@/components/LoaderSpinner';
import { AllPraiseList } from '@/model/praise';
import { PraiseDto } from 'api/dist/praise/types';
import React from 'react';
import { useHistory } from 'react-router-dom';
import { TableOptions, useTable } from 'react-table';
import { useRecoilValue } from 'recoil';
import PraisePageLoader from './PraisePageLoader';
import Praise from '../../../components/praise/Praise';

export const ALL_PRAISE_LIST_KEY = 'ALL_PRAISE';

const PraiseTable = (): JSX.Element => {
  const history = useHistory();
  const allPraise = useRecoilValue(AllPraiseList(ALL_PRAISE_LIST_KEY));
  const columns = React.useMemo(
    () => [
      {
        accessor: 'createdAt',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        Cell: (data: any) => <Praise praise={data.row.original} />,
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
