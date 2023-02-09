import * as duckdb from '@duckdb/duckdb-wasm';
import { useRecoilValue } from 'recoil';
import { useDuckDbWorker } from './use-duckbd-worker.hook';
import { Parquet } from '../state/parquet.state';
import React from 'react';

type ExportUrls = {
  users?: string;
  userAccounts?: string;
  periods?: string;
  praise?: string;
  quantifications?: string;
};

type TablesCreated = {
  users: boolean;
  userAccounts: boolean;
  periods: boolean;
  praise: boolean;
  quantifications: boolean;
};

const tablesDefaults: TablesCreated = {
  users: false,
  userAccounts: false,
  periods: false,
  praise: false,
  quantifications: false,
};

export type DuckDbReturn = {
  db: duckdb.AsyncDuckDB | undefined;
  loadingWorker: boolean;
  tables: TablesCreated;
};

export function useDuckDb(urls: ExportUrls): DuckDbReturn {
  const [db, setDb] = React.useState<duckdb.AsyncDuckDB>();
  const { worker, loading: loadingWorker } = useDuckDbWorker();
  const [tables, setTables] = React.useState<TablesCreated>(tablesDefaults);

  // Fetch the parquet files from the API
  const usersParquet = useRecoilValue(Parquet(urls.users));
  const userAccountsParquet = useRecoilValue(Parquet(urls.userAccounts));
  const periodsParquet = useRecoilValue(Parquet(urls.periods));
  const praiseParquet = useRecoilValue(Parquet(urls.praise));
  const quantificationsParquet = useRecoilValue(Parquet(urls.quantifications));

  /**
   *  This effect is triggered when the worker is loaded to instantiate the database.
   */
  React.useEffect(() => {
    if (loadingWorker || !worker) {
      return;
    }
    const initDuckDb = async (): Promise<void> => {
      // Instantiate the asynchronus version of DuckDB-wasm
      const logger = new duckdb.VoidLogger();
      const db = new duckdb.AsyncDuckDB(logger, worker);

      // Attempt connect to the database. If it fails, instantiate the database
      try {
        await db.connect();
      } catch (e) {
        // Get all available bundles from jsDelivr
        const allDuckDbBundles = duckdb.getJsDelivrBundles();

        // Select a bundle based on browser checks
        const duckDbBundle = await duckdb.selectBundle(allDuckDbBundles);

        // Instantiate the database
        await db.instantiate(
          duckDbBundle.mainModule,
          duckDbBundle.pthreadWorker
        );
      }

      setDb(db);
    };
    void initDuckDb();
  }, [worker, loadingWorker]);

  /**
   * Create a table in the database from a parquet file if database is loaded and
   * parquet file is available.
   */
  const createTable = React.useCallback(
    async (parquet: ArrayBuffer | undefined, table: string): Promise<void> => {
      // If database is not loaded or parquet file is not available, return
      if (!db || !parquet || parquet.byteLength === 0) {
        // Mark the table as not created
        setTables((tables) => ({ ...tables, [table]: false }));
        return;
      }

      // Convert the parquet file to a Uint8Array
      const uInt8Array = new Uint8Array(parquet);

      // Register the parquet file in the database
      await db.registerFileBuffer(`${table}.parquet`, uInt8Array);

      // Create a table in the database from the parquet file
      const conn = await db.connect();
      await conn.query(`DROP TABLE IF EXISTS ${table};`);
      await conn.query(
        `CREATE TABLE ${table} AS SELECT * FROM read_parquet('${table}.parquet');`
      );

      // Mark the table as created
      setTables((tables) => ({ ...tables, [table]: true }));
    },
    [db]
  );

  /**
   * Trigger createTable for each parquet file when it is loaded.
   */
  React.useEffect(() => {
    void createTable(usersParquet, 'users');
  }, [usersParquet, createTable]);

  React.useEffect(() => {
    void createTable(userAccountsParquet, 'useraccounts');
  }, [userAccountsParquet, createTable]);

  React.useEffect(() => {
    void createTable(periodsParquet, 'periods');
  }, [periodsParquet, createTable]);

  React.useEffect(() => {
    void createTable(praiseParquet, 'praise');
  }, [praiseParquet, createTable]);

  React.useEffect(() => {
    void createTable(quantificationsParquet, 'quantifications');
  }, [quantificationsParquet, createTable]);

  return { db, loadingWorker, tables };
}
