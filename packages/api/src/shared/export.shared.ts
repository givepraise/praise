import { Transform } from '@json2csv/node';
import { Cursor } from 'mongoose';
import stream from 'stream';
import { ExportInputDto } from './dto/export-input.dto';
import crypto from 'crypto';
import * as fs from 'fs';
import duckdb from 'duckdb';
import { exec } from './duckdb.shared';

/**
 *  Create a hashed id based on the export options excluding export format
 */
export function exportOptionsHash(options: ExportInputDto): string {
  const { startDate, endDate } = options;
  return crypto
    .createHash('shake256', { outputLength: 5 })
    .update(JSON.stringify({ startDate, endDate }))
    .digest('hex');
}

/**
 * Get the return content type based on the export format
 */
export function exportContentType(format: string): string {
  switch (format) {
    case 'parquet':
      return 'application/octet-stream';
    case 'json':
      return 'application/json';
    default:
      return 'text/csv'; // csv
  }
}

/**
 * Creates a write stream that can be used to write the periods to a json file
 */
export function createJsonWriter(
  path: string,
  model: string,
): stream.Transform {
  const writer = fs.createWriteStream(`${path}/${model}.json`);

  let separator = '';
  const jsonWriter = new stream.Transform({
    objectMode: true,
    transform: (data, _, done) => {
      writer.write(`${separator}${JSON.stringify(data)}`);
      separator = ',';
      done(null, data);
    },
  });

  writer.write('[');

  jsonWriter.on('finish', () => {
    writer.write(']');
    writer.end();
  });

  return jsonWriter;
}

/**
 * Writes the periods to a csv and json file
 */
export async function writeCsvAndJsonExports(
  model: string,
  cursor: Cursor<any, never>,
  path: string,
  includeFields: string[],
) {
  // Wrap stream transformation in a promise and return
  return new Promise(async (resolve) => {
    const jsonWriter = createJsonWriter(path, model);
    const csvTransformer = new Transform(
      { fields: includeFields },
      { objectMode: true },
    );

    const csvWriter = fs.createWriteStream(`${path}/${model}.csv`);

    cursor.on('end', () => {
      resolve(true);
    });

    cursor.pipe(jsonWriter).pipe(csvTransformer).pipe(csvWriter);
  });
}

/**
 * Create a duckdb database, import the csv file, and export it to parquet
 */
export async function generateParquetExport(
  path: string,
  model: string,
  schema: string,
) {
  const db = new duckdb.Database(':memory:');
  await exec(db, `CREATE TABLE ${model} (${schema})`);
  await exec(
    db,
    `COPY ${model} FROM '${path}/${model}.csv' (AUTO_DETECT TRUE, HEADER TRUE);`,
  );
  await exec(
    db,
    `COPY ${model} TO '${path}/${model}.parquet' (FORMAT PARQUET);`,
  );
}
