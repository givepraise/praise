import { hostNameToDbName } from './host-name-to-db-name';

/**
 * Return the database URL for the given hostname. That means in most
 * cases an URL pointing to the database with the same name as the hostname.
 * But if the hostname is 'api' or the same as the HOST environment variable,
 * then the URL will point to the main database.
 * - 'api' is the hostname used when
 * calling the API from other services in the same docker network.
 * - HOST is the hostname defined in the .env file. It is the hostname
 * used when calling the API from outside the docker network by services
 * like the setupweb.
 */
export const getDbUrl = (hostname: string) => {
  return (process.env.MONGO_URI as string).replace(
    '{DB}',
    hostNameToDbName(hostname),
  );
};
