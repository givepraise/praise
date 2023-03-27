import duckdb from 'duckdb';

/**
 * Wrapper for duckdb.exec() that returns a promise
 */
export function exec(db: duckdb.Database, query: string) {
  return new Promise((resolve, reject) => {
    db.exec(query, (err: any, res: any) => {
      if (err) {
        return reject(err);
      }
      return resolve(res);
    });
  });
}
