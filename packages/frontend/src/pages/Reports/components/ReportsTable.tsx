/* eslint-disable react/jsx-key */
import React, { EventHandler } from 'react';
import { TableOptions, useSortBy, useTable } from 'react-table';
import { useRecoilValue } from 'recoil';
import { classNames } from '@/utils/index';
import { InlineLabel } from '@/components/ui/InlineLabel';
import { AllReports } from '../../../model/report/reports';
import { ReportManifestDto } from '../../../model/report/dto/report-manifest.dto';
import { AllPeriods } from '../../../model/periods/periods';

type ReportsTableProps = {
  onClick: (manifest: ReportManifestDto) => EventHandler<React.MouseEvent>;
  include?: string[];
  exclude?: string[];
};

export const ReportsTable = ({
  onClick: handleClick,
  include,
  exclude,
}: ReportsTableProps): JSX.Element => {
  const allReports = useRecoilValue(AllReports);
  const allPeriods = useRecoilValue(AllPeriods);

  // Filter reports based on include and exclude
  const filteredReports = React.useMemo(() => {
    if (!Array.isArray(allReports)) return [];

    // If no filters are set, return all reports
    // If include is set, return only reports that match the include
    // If exclude is set, return only reports that do not match the exclude
    if (include?.length === 0 && exclude?.length === 0) return allReports;
    let filteredReports = allReports;
    if (include && include.length > 0) {
      filteredReports = allReports.filter((report) => {
        return report.categories.some((category) => include.includes(category));
      });
    }
    if (exclude && exclude.length > 0) {
      filteredReports = filteredReports.filter((report) => {
        return !report.categories.some((category) =>
          exclude.includes(category)
        );
      });
    }
    return filteredReports;
  }, [allReports, include, exclude]);

  const columns = React.useMemo(
    () => [
      {
        Header: 'Report',
        accessor: 'displayName',
        className: 'pl-5 text-left',
      },
      {
        Header: 'Description',
        accessor: 'description',
        className: 'pl-5 text-left',
      },
      {
        Header: 'Author',
        accessor: 'author',
        className: 'pl-5 text-left',
      },
      {
        Header: '',
        accessor: 'keywords',
        className: 'pr-5 text-right',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        Cell: (data: any): JSX.Element => {
          return (
            <div className="w-full text-right">
              {data.value.map((category: string) => (
                <InlineLabel
                  text={category}
                  className="uppercase"
                  key={category}
                />
              ))}
            </div>
          );
        },
      },
    ],
    []
  );

  const options = {
    columns,
    data: filteredReports || [],
  } as TableOptions<{}>;
  const tableInstance = useTable(options, useSortBy);

  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } =
    tableInstance;

  if (!Array.isArray(allReports) || allReports.length === 0)
    return (
      <div className="px-5">No reports available. Please check back later.</div>
    );

  return (
    <div className="min-w-full overflow-x-auto sm:min-w-0">
      <table
        className="table-auto min-w-max sm:min-w-fit md:min-w-full"
        {...getTableProps()}
      >
        <thead>
          {headerGroups.map((headerGroup) => {
            const { key, ...restHeaderGroupProps } =
              headerGroup.getHeaderGroupProps();
            return (
              <tr className="px-5" key={key} {...restHeaderGroupProps}>
                {headerGroup.headers.map((column) => {
                  const { key, ...restColumn } = column.getHeaderProps();
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  const className = (column as any).className as string;
                  return (
                    <th
                      className={classNames(className, 'pb-2')}
                      key={key}
                      {...restColumn}
                    >
                      {column.render('Header')}
                    </th>
                  );
                })}
              </tr>
            );
          })}
        </thead>
        <tbody {...getTableBodyProps()}>
          {rows.map((row) => {
            prepareRow(row);
            const { key, ...restRowProps } = row.getRowProps();
            return (
              <tr
                className={classNames(
                  row.values.status === 'CLOSED' ? 'text-warm-gray-400' : '',
                  allPeriods.length > 0
                    ? 'px-5 cursor-pointer hover:bg-warm-gray-100 dark:hover:bg-slate-500'
                    : 'px-5 text-warm-gray-400'
                )}
                onClick={handleClick(row.original as ReportManifestDto)}
                key={key}
                {...restRowProps}
              >
                {row.cells.map((cell) => {
                  const { key, ...restCellProps } = cell.getCellProps();

                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  const className = (cell.column as any).className as string;
                  return (
                    <td
                      className={classNames(className, 'py-3')}
                      key={key}
                      {...restCellProps}
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
    </div>
  );
};
