import { MongoClient } from 'mongodb';
import { logger } from '../../shared/logger';

/**
 * Check if a database exists. Returns true if it does, false if it doesn't.
 */
export async function databaseExists(
  databaseName: string,
  client: MongoClient,
) {

  try {
    // As mongo client just can connect to DB one time, we put it in try-catch because for next times it would return error
    // Connect to the MongoDB server
    await client.connect();
  }catch (e){
    logger.error(`databaseExists mongo client connect error ${e.message}`)
  }

  // Get the list of databases
  const databasesList = await client.db().admin().listDatabases();

  // Check if the database exists in the list
  const databaseExists = databasesList.databases.some(
    (db) => db.name === databaseName,
  );

  return databaseExists;
}
