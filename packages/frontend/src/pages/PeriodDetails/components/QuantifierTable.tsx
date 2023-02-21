/* eslint-disable react/jsx-key */
import React, { useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { TableOptions, useTable } from 'react-table';
import { useRecoilValue } from 'recoil';
import sortBy from 'lodash/sortBy';
import { faArrowRightArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { toast } from 'react-hot-toast';
import {
  PeriodPageParams,
  SinglePeriod,
  useReplaceQuantifier,
  useLoadSinglePeriodDetails,
} from '@/model/periods/periods';
import { Notice } from '@/components/ui/Notice';
import { classNames } from '@/utils/index';
import { UserAvatarAndName } from '@/components/user/UserAvatarAndName';
import { HasRole, ROLE_ADMIN } from '@/model/auth/auth';
import { isResponseOk } from '@/model/api';
import { ReplaceQuantifierDialog } from './ReplaceQuantifierDialog';
import { Quantifier } from '@/model/useraccount/interfaces/quantifier.interface';

const QuantifierTable = (): JSX.Element => {
  const { periodId } = useParams<PeriodPageParams>();
  const history = useHistory();
  const isAdmin = useRecoilValue(HasRole(ROLE_ADMIN));
  useLoadSinglePeriodDetails(periodId);
  const period = useRecoilValue(SinglePeriod(periodId));

  const [isReplaceQuantifierDialogOpen, setIsReplaceQuantifierDialogOpen] =
    useState<boolean>(false);
  const [quantifierToReplace, setQuantifierToReplace] = useState<
    Quantifier | undefined
  >(undefined);

  const { replaceQuantifier } = useReplaceQuantifier(periodId);

  const handleReplaceQuantifier = async (
    newQuantifierUserId: string
  ): Promise<void> => {
    if (!quantifierToReplace) return;
    toast.loading('Replacing quantifier...');

    const response = await replaceQuantifier(
      quantifierToReplace?._id,
      newQuantifierUserId
    );

    if (isResponseOk(response)) {
      toast.success('Replaced quantifier and reset their scores');
      setTimeout(() => history.go(0), 2000);
    }
  };

  const columns = React.useMemo(
    () => [
      {
        Header: 'Quantifier',
        accessor: '_id',
        className: 'text-left pl-5',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        Cell: (data: any): JSX.Element => (
          <UserAvatarAndName
            userId={data.row.original._id}
            avatarClassName="text-2xl"
          />
        ),
      },
      {
        Header: 'Finished items',
        accessor: '',
        className: 'text-right pr-5',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        Cell: (data: any): JSX.Element => (
          <div>
            {`${data.row.original.finishedCount} / ${data.row.original.praiseCount}`}
          </div>
        ),
      },
      {
        id: 3,
        accessor: '',
        className: 'text-right',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        Cell: (data: any): JSX.Element | null => {
          if (!isAdmin) return null;

          return (
            <div className="w-3">
              <button
                className="hidden cursor-pointer text-warm-gray-400 group-hover:block hover:text-warm-gray-500 dark:hover:text-warm-gray-300"
                onClick={(event): void => {
                  event.stopPropagation();
                  setQuantifierToReplace(data.row.original);
                  setIsReplaceQuantifierDialogOpen(true);
                }}
              >
                <FontAwesomeIcon icon={faArrowRightArrowLeft} size="1x" />
              </button>
            </div>
          );
        },
      },
    ],
    [isAdmin]
  );

  const data = period?.quantifiers
    ? sortBy(period.quantifiers, [
        // First, sort by amount of praise remaining
        (quantifier): number => {
          return -1 * (quantifier.finishedCount / quantifier.praiseCount);
        },

        // Then by quantifier _id
        (quantifier): string => quantifier._id.toString(),
      ])
    : [];

  const options = {
    columns,
    data,
  } as TableOptions<{}>;
  const tableInstance = useTable(options);
  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } =
    tableInstance;

  if (!period) return <div>Period not found.</div>;

  if (period.status === 'OPEN')
    return (
      <div className="flex items-center justify-center w-full h-full">
        No quantifiers have been assigned for this period.
      </div>
    );

  if (period?.receivers?.length === 0)
    return (
      <div className="flex items-center w-full h-full">
        <Notice type="danger">
          <span>No quantifiers found in this period</span>
        </Notice>
      </div>
    );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleClick = (data: any) => (): void => {
    history.push(`/periods/${periodId}/quantifier/${data._id}`);
  };

  return (
    <>
      <table
        id="periods-table"
        className="w-full table-auto"
        {...getTableProps()}
      >
        <thead>
          {headerGroups.map((headerGroup) => (
            <tr {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map((column) => {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const className = (column as any).className as string;
                return (
                  <th
                    {...column.getHeaderProps()}
                    className={classNames(className, 'pb-2')}
                  >
                    {column.render('Header')}
                  </th>
                );
              })}
            </tr>
          ))}
        </thead>
        <tbody {...getTableBodyProps()}>
          {rows.map((row) => {
            prepareRow(row);
            return (
              <tr
                className="cursor-pointer group hover:bg-warm-gray-100 dark:hover:bg-slate-500"
                {...row.getRowProps()}
                onClick={handleClick(row.original)}
              >
                {row.cells.map((cell) => {
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  const className = (cell.column as any).className as string;
                  return (
                    <td
                      {...cell.getCellProps()}
                      className={classNames(className, 'py-3')}
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
      <ReplaceQuantifierDialog
        open={isReplaceQuantifierDialogOpen}
        selectedUserId={quantifierToReplace?._id}
        onClose={(): void => {
          setIsReplaceQuantifierDialogOpen(false);
          setQuantifierToReplace(undefined);
        }}
        onConfirm={async (newQuantifierUserId): Promise<void> =>
          await handleReplaceQuantifier(newQuantifierUserId)
        }
      />
    </>
  );
};

// eslint-disable-next-line import/no-default-export
export default QuantifierTable;
