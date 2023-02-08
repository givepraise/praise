import {
  faPrayingHands,
  faUser,
  faUsers,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useState } from 'react';
import { BreadCrumb } from '@/components/ui/BreadCrumb';
import { ActiveNoticesBoard } from '@/components/periods/ActiveNoticesBoard';
import { Box } from '@/components/ui/Box';
import { Page } from '@/components/ui/Page';
import { Button } from '@/components/ui/Button';
import { PraiseTable } from './components/PraiseTable';
import { MyPraiseTable } from './components/MyPraiseTable';
import * as duckdb from '@duckdb/duckdb-wasm';
import { DuckDBDataProtocol } from '@duckdb/duckdb-wasm';
import * as arrow from '@apache-arrow/ts';

const initDuckDB = async (): Promise<void> => {
  const JSDELIVR_BUNDLES = duckdb.getJsDelivrBundles();

  // Select a bundle based on browser checks
  const bundle = await duckdb.selectBundle(JSDELIVR_BUNDLES);

  const worker_url = URL.createObjectURL(
    new Blob([`importScripts("${bundle.mainWorker!}");`], {
      type: 'text/javascript',
    })
  );

  // Instantiate the asynchronus version of DuckDB-wasm
  const worker = new Worker(worker_url);
  const logger = new duckdb.ConsoleLogger();
  const db = new duckdb.AsyncDuckDB(logger, worker);
  await db.instantiate(bundle.mainModule, bundle.pthreadWorker);
  URL.revokeObjectURL(worker_url);

  const req = await fetch('http://localhost:8099/api/users/csv');
  const csv = new Uint8Array(await req.arrayBuffer());

  await db.registerFileBuffer('users.csv', csv);

  // Create a connection to the database
  const conn = await db.connect();

  await conn.query(
    "CREATE TABLE users AS SELECT * FROM read_csv_auto('users.csv', header=True);"
  );

  const res3 = await conn.query('DESCRIBE users;');
  console.log(res3.toString());

  const res = await conn.query('SELECT * FROM users;');
  console.log(res.toString());

  const res4 = await conn.query('SELECT count(*) FROM users;');
  console.log(res4.toString());
};

const StartPage = (): JSX.Element => {
  const pageViews = {
    praiseView: 1,
    myPraiseView: 2,
  };

  void initDuckDB();
  const [view, setView] = useState<number>(pageViews.praiseView);

  return (
    <Page>
      <BreadCrumb name="Praise" icon={faPrayingHands} />
      <ActiveNoticesBoard />

      <div className="flex mt-5 mb-5 ml-4 md:ml-0">
        <Button
          variant={'outline'}
          className={`rounded-r-none  ${
            view === pageViews.myPraiseView
              ? 'bg-opacity-50 text-opacity-50 hover:border-themecolor-4'
              : 'hover:bg-themecolor-3 hover:border-themecolor-3'
          }`}
          onClick={(): void => setView(pageViews.praiseView)}
        >
          <FontAwesomeIcon icon={faUsers} size="1x" className="mr-2" />
          All Praise
        </Button>
        <Button
          variant={'outline'}
          className={`rounded-l-none  ${
            view === pageViews.praiseView
              ? 'bg-opacity-50  text-opacity-50 hover:border-themecolor-4 '
              : 'hover:bg-themecolor-3 hover:border-themecolor-3'
          }`}
          onClick={(): void => setView(pageViews.myPraiseView)}
        >
          <FontAwesomeIcon icon={faUser} size="1x" className="mr-2" />
          My Praise
        </Button>
      </div>

      <Box className="p-0">
        {view === pageViews.praiseView ? <PraiseTable /> : <MyPraiseTable />}
      </Box>
    </Page>
  );
};

// eslint-disable-next-line import/no-default-export
export default StartPage;
