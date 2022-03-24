import { exit } from 'process';
import { connectDatabase } from './core';
import { setupMigrator } from '../database/migration';

void (async (): Promise<void> => {
    const connection = await connectDatabase();

    const umzug = setupMigrator(connection);

    if (require.main === module) {
        await umzug.runAsCLI()
    }
    exit();
})();