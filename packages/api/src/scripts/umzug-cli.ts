import { exit } from 'process';
import { connectDatabase } from './core';
import { setupMigrator } from '../database/migration';

void (async (): Promise<void> => {
  const db = await connectDatabase('localhost');
  const umzug = setupMigrator(db.connection);

  if (require.main === module) {
    await umzug.runAsCLI();
  }
  exit();
})();
