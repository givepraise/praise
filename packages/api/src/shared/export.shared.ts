import duckdb from 'duckdb';
import { exec } from './duckdb.shared';
import { ExportInputDto } from './dto/export-input.dto';

/**
 * Converts the ExportInputDto to a query that can be used to filter a praise/quantifications query
 */
export async function exportInputToQuery(options: ExportInputDto) {
  const { startDate, endDate } = options;
  const query: any = {
    createdAt: {
      $gte: startDate,
      $lte: endDate,
    },
  };
  return query;
}

/**
 * Create a parquet file from a csv file using duckdb according to the schema
 */
export async function generateParquetExport(
  model: string,
  schema: string,
  csvPath: string,
  parquetPath: string,
) {
  const db = new duckdb.Database(':memory:');
  await exec(db, `CREATE TABLE ${model} (${schema})`);
  await exec(
    db,
    `COPY ${model} FROM '${csvPath}' (AUTO_DETECT TRUE, HEADER TRUE);`,
  );
  await exec(db, `COPY ${model} TO '${parquetPath}' (FORMAT PARQUET);`);
}
