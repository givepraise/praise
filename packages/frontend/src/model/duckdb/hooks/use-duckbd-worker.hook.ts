import * as duckdb from '@duckdb/duckdb-wasm';
import React from 'react';
import { UseDuckDbWorkerReturn } from '../types/use-duckdb-worker-return.type';

export function useDuckDbWorker(): UseDuckDbWorkerReturn {
  const [worker, setWorker] = React.useState<Worker | undefined>(undefined);

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

      // Set the worker
      setWorker(worker);
    };
    void loadDuckDbWorker();
  }, [worker, setWorker]);

  return { worker, loading: !worker };
}
