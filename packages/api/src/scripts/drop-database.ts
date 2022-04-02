import { PeriodModel } from '@period/entities';
import { PraiseModel } from '@praise/entities';
import { UserModel } from '@user/entities';
import { UserAccountModel } from '@useraccount/entities';
import { SettingsModel } from '@settings/entities';
import { PeriodSettingsModel } from '@periodsettings/entities';
import { connectDatabase } from './core';

connectDatabase().then(async (connection) => {
    try {
        await Promise.all(
            [
                PeriodModel.deleteMany({}),
                PraiseModel.deleteMany({}),
                UserModel.deleteMany({}),
                UserAccountModel.deleteMany({}),
                SettingsModel.deleteMany({}),
                PeriodSettingsModel.deleteMany({}),
            ]);
        console.log('Deleted all collections');

    } catch (err) {
        console.error(`Failed to delete all collections ${(err as Error).message}`);
    }

    process.exit();
});