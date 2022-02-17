import { ActiveUserId } from '@/model/auth';
import { usePeriodQuantifierPraiseQuery } from '@/model/periods';
import { faCheckCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { useRecoilValue } from 'recoil';

const DoneLabel = () => {
  return (
    <div className="pl-1 pr-1 ml-2 text-xs text-white no-underline bg-green-400 py-[3px] rounded inline-block relative top-[-1px]">
      <FontAwesomeIcon icon={faCheckCircle} size="1x" className="mr-2" />
      Done
    </div>
  );
};

const QuantifyPeriodTable = () => {
  const history = useHistory();
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
  const { periodId } = useParams() as any;
  const userId = useRecoilValue(ActiveUserId);

  interface QuantifyPeriodTableInnerParams {
    quantifierId: string;
  }
  const QuantifyPeriodTableInner = ({
    quantifierId,
  }: QuantifyPeriodTableInnerParams) => {
    const praiseList = usePeriodQuantifierPraiseQuery(periodId, quantifierId);
    return null;
  };

  if (!userId) return null;
  return <QuantifyPeriodTableInner quantifierId={userId} />;

  // const data = useRecoilValue(PeriodActiveQuantifierReceivers({ periodId }));
  // const usePseudonyms = useRecoilValue(
  //   SingleBooleanSetting('PRAISE_QUANTIFY_RECEIVER_PSEUDONYMS')
  // );
  // const columns = React.useMemo(
  //   () => [
  //     {
  //       Header: 'Receiver',
  //       accessor: 'receiverName',
  //       Cell: (data: any) => {
  //         return usePseudonyms ? (
  //           <UserPseudonym
  //             userId={data.row.original.receiverId}
  //             periodId={data.row.original.periodId}
  //           />
  //         ) : (
  //           data.value
  //         );
  //       },
  //     },
  //     {
  //       Header: 'Remaining items',
  //       accessor: 'count',
  //       Cell: (data: any) => {
  //         const item = data.row.original;
  //         if (!item) return null;
  //         // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
  //         return `${item.count - item.done} / ${item.count}`;
  //       },
  //     },
  //     {
  //       Header: '',
  //       accessor: 'done',
  //       Cell: (data: any) => {
  //         const item = data.row.original;
  //         if (!item) return null;
  //         return item.count - item.done === 0 ? (
  //           <div className="w-full text-right">
  //             <DoneLabel />
  //           </div>
  //         ) : null;
  //       },
  //     },
  //   ],
  //   [usePseudonyms]
  // );

  // const options = {
  //   columns,
  //   data: data ? data : [],
  // } as TableOptions<{}>;
  // const tableInstance = useTable(options);

  // const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } =
  //   tableInstance;

  // const handleClick = (data: QuantifierReceiverData) => (e: SyntheticEvent) => {
  //   history.push(
  //     `/quantify/period/${data.periodId}/receiver/${data.receiverId}`
  //   );
  // };
  // return (
  //   <table
  //     id="periods-table"
  //     className="w-full table-auto"
  //     {...getTableProps()}
  //   >
  //     <thead>
  //       {headerGroups.map((headerGroup) => (
  //         // eslint-disable-next-line react/jsx-key
  //         <tr {...headerGroup.getHeaderGroupProps()}>
  //           {headerGroup.headers.map((column) => (
  //             // eslint-disable-next-line react/jsx-key
  //             <th className="text-left" {...column.getHeaderProps()}>
  //               {column.render('Header')}
  //             </th>
  //           ))}
  //         </tr>
  //       ))}
  //     </thead>
  //     <tbody {...getTableBodyProps()}>
  //       {rows.map((row) => {
  //         prepareRow(row);
  //         return (
  //           // eslint-disable-next-line react/jsx-key
  //           <tr
  //             className="cursor-pointer hover:bg-gray-100"
  //             id=""
  //             {...row.getRowProps()}
  //             onClick={handleClick(row.original as QuantifierReceiverData)}
  //           >
  //             {row.cells.map((cell) => {
  //               // eslint-disable-next-line react/jsx-key
  //               return <td {...cell.getCellProps()}>{cell.render('Cell')}</td>;
  //             })}
  //           </tr>
  //         );
  //       })}
  //     </tbody>
  //   </table>
  // );
};

export default QuantifyPeriodTable;
