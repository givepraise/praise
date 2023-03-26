import { MongoClient } from 'mongodb';

/**
 * Check if a database exists. Returns true if it does, false if it doesn't.
 */
export async function databaseExists(
  databaseName: string,
  client: MongoClient,
) {
  // Connect to the MongoDB server
  await client.connect();

  // Get the list of databases
  const databasesList = await client.db().admin().listDatabases();

  // Check if the database exists in the list
  const databaseExists = databasesList.databases.some(
    (db) => db.name === databaseName,
  );

  return databaseExists;
}
