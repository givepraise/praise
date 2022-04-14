import { UserAccountModel } from '@useraccount/entities';
import { connectDatabase } from './core';
import { exit } from 'process';

const run = async (): Promise<void> => {
  await connectDatabase();

  const userAccounts = await UserAccountModel.find({ user: null });
  userAccounts.map((ua) => console.log(ua.name));

  exit();
};

run();
