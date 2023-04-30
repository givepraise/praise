import { DuckDbContext } from './DuckDb';
import { AsyncDuckDBConnection } from '@duckdb/duckdb-wasm';
import * as Graph from './layout';

import React from 'react';

type GraphData = {
  praiseScore: number;
  praiseScorePrevious: number;
};

const scoreQuery = async (
  conn: AsyncDuckDBConnection,
  d1: string,
  d2: string
): Promise<number> => {
  const result = await conn.query(`SELECT 
      SUM(score) as score
    FROM praises
    WHERE praises.createdAt > '${d1}' AND praises.createdAt <= '${d2}'         
  ;`);
  return result.toArray()[0].toJSON().score;
};

const scoreQueryPrevious = async (
  conn: AsyncDuckDBConnection,
  d1: string,
  d2: string
): Promise<number> => {
  const result = await conn.query(`SELECT 
      SUM(score) as score
    FROM praises
    WHERE praises.createdAt > '${d1}' AND praises.createdAt <= '${d2}'         
  ;`);
  return result.toArray()[0].toJSON().score;
};

const PraiseScore = ({
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
        praiseScore: await scoreQuery(conn, date2, date3),
        praiseScorePrevious: await scoreQueryPrevious(conn, date1, date2),
      };
      setData(graphData);
    };
    void run();
  }, [dbContext, date2, date1, date3]);

  if (!data) return <Graph.LoadPlaceholder size="S" />;

  return (
    <Graph.Frame>
      <Graph.Header>Praise Score</Graph.Header>
      <Graph.HeaderNumber value={data.praiseScore} />
      <Graph.LargeValueChangePill
        value1={data.praiseScorePrevious} // previous
        value2={data.praiseScore} // current
      />
      <div className="p-2">&nbsp;</div>
    </Graph.Frame>
  );
};

export default PraiseScore;
