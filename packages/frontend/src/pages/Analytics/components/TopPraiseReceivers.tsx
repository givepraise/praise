import { DuckDbContext } from './DuckDb';
import { AsyncDuckDBConnection } from '@duckdb/duckdb-wasm';
import * as Graph from './layout';

import React from 'react';
import { Column, useTable } from 'react-table';

type dataType = {
  username: string;
  useraccountname: string;
  score: number;
};

type GraphData = {
  topReceivers: dataType[];
};

const giversQuery = async (
  conn: AsyncDuckDBConnection,
  d1: string,
  d2: string
): Promise<dataType[]> => {
  const result = await conn.query(`SELECT 
      ANY_VALUE(users.username) AS username,
      ANY_VALUE(useraccounts.name) AS useraccountname,
      SUM(score) as score
    FROM praises
    LEFT JOIN useraccounts ON praises.receiver = useraccounts._id
    LEFT JOIN users ON useraccounts.user = users._id
    WHERE praises.createdAt > '${d1}' AND praises.createdAt <= '${d2}'         
    GROUP BY receiver
    ORDER BY SUM(score) DESC
    LIMIT 10
  ;`);
  return result.toArray().map((row) => row.toJSON());
};

const TopPraiseReceivers = ({
  date1,
  date2,
  date3,
}: {
  date1: string;
  date2: string;
  date3: string;
}): JSX.Element | null => {
  const dbContext = React.useContext(DuckDbContext);
  const [data, setData] = React.useState<GraphData | null>(null);

  /**
   * Load data from DuckDB.
   */
  React.useEffect(() => {
    if (!dbContext?.db || !dbContext?.tablesLoaded) return;
    const run = async (): Promise<void> => {
      if (!dbContext?.db) return;

      // Connect to database
      const conn = await dbContext.db.connect();

      const graphData: GraphData = {
        topReceivers: await giversQuery(conn, date2, date3),
      };

      setData(graphData);
    };
    void run();
  }, [dbContext, date2, date1, date3]);

  const columns = React.useMemo<Column[]>(
    () => [
      {
        Header: 'Username',
        accessor: 'username',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        Cell: (data: any) => (
          <div className="overflow-hidden overflow-ellipsis whitespace-nowrap">
            {data.value ? data.value : data.row.original.useraccountname}
          </div>
        ),
      },
      {
        Header: 'Score',
        accessor: 'score',
        className: 'text-right w-12',
        Cell: ({ value }: { value: number }) => (
          <span className="opacity-70">
            {new Intl.NumberFormat().format(Math.round(value))}
          </span>
        ),
      },
    ],
    []
  );

  const { getTableProps, getTableBodyProps, rows, prepareRow } =
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    useTable({ columns, data: (data?.topReceivers || []) as any });

  if (!data) return <Graph.LoadPlaceholder />;

  return (
    <Graph.Frame>
      <Graph.Header>Top praise receivers</Graph.Header>
      <table {...getTableProps()} className="w-full overflow-auto table-fixed">
        <tbody {...getTableBodyProps()}>
          {rows.map((row) => {
            prepareRow(row);
            return (
              <tr {...row.getRowProps()} key={row.id}>
                {row.cells.map((cell) => {
                  return (
                    <td
                      {...cell.getCellProps()}
                      key={cell.column.id}
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      className={(cell.column as any).className}
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
    </Graph.Frame>
  );
};

export default TopPraiseReceivers;
