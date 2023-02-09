import * as duckdb from '@duckdb/duckdb-wasm';
import { useRecoilState } from 'recoil';
import { DuckDbWorker as DuckDbWorkerReturn } from '../state/duckdb-worker.state';
import React from 'react';

type DuckDbWorkerReturn = {
  worker: Worker;
  loading: boolean;
};

export function useDuckDbWorker(): DuckDbWorkerReturn {
  const [worker, setWorker] = useRecoilState(DuckDbWorkerReturn);

  React.useEffect(() => {
    if (worker) {
      return;
    }
    const loadDuckDbWorker = async (): Promise<void> => {
      // Get all available bundles from jsDelivr
      const allDuckDbBundles = duckdb.getJsDelivrBundles();

      // Select a bundle based on browser checks
      const duckDbBundle = await duckdb.selectBundle(allDuckDbBundles);
      if (!duckDbBundle.mainWorker) {
        throw new Error('Unable to find main worker');
      }

      // Create a worker URL to instantiate the worker
      const workerUrl = URL.createObjectURL(
        new Blob([`importScripts("${duckDbBundle.mainWorker}");`], {
          type: 'text/javascript',
        })
      );

      // Instantiate the asynchronus version of DuckDB-wasm
      const worker = new Worker(workerUrl);

      // Release the worker URL to avoid memory leaks
      URL.revokeObjectURL(workerUrl);

      setWorker(worker);
    };
    void loadDuckDbWorker();
  }, [worker, setWorker]);

  return { worker, loading: !worker };
}
