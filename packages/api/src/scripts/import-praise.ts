import { PraiseModel } from '@praise/entities';
import { PraiseImportInput } from '@praise/types';
import { UserAccountModel } from '@useraccount/entities';
import { UserAccountDocument } from '@useraccount/types';
import 'express-async-errors';
import fs from 'fs';
import path from 'path';
import { connectDatabase } from './core';

const importPraise = async (
  praiseData: PraiseImportInput[],
  sloppyImport: boolean
) => {
  try {
    let isValid = true;
    let missingNames: string[] = [];
    // Check import file validity, correct what can be corrected
    praiseData = praiseData.filter((praise, index) => {
      process.stdout.write(`Parsing praise ${index}/${praiseData.length}\r`);

      // Empty reason gets default text.
      if (!praise.reason || praise.reason === '') {
        praise.reason = 'No reason given.';
      }

      if (!praise.giver.accountId) {
        console.log(
          `${index}: Giver accountId for ${praise.giver.name} is missing.`
        );
        missingNames.push(praise.giver.name);
        if (sloppyImport) {
          return false;
        }
        isValid = false;
      }

      if (!praise.receiver.accountId) {
        console.log(
          `${index}: Receiver accountId for ${praise.receiver.name} is missing.`
        );
        missingNames.push(praise.receiver.name);
        if (sloppyImport) {
          return false;
        }
        isValid = false;
      }

      return true;
    });

    if (missingNames.length > 0) {
      const distinctNames = [...new Set(missingNames)];
      console.log('\nDistinct missing usernames:\n');
      for (let name of distinctNames) {
        let n = name.split('#');
        console.log(`${n[0]},${n[1]}`);
      }
    }

    if (!isValid) {
      throw new Error('Invalid import format.');
    }

    const data = await Promise.all(
      praiseData.map(async (praise: PraiseImportInput) => {
        const giver = await UserAccountModel.findOneAndUpdate(
          { accountId: praise.giver.accountId },
          praise.giver as UserAccountDocument,
          { upsert: true, new: true }
        );

        const receiver = await UserAccountModel.findOneAndUpdate(
          { accountId: praise.receiver.accountId },
          praise.receiver as UserAccountDocument,
          { upsert: true, new: true }
        );

        return {
          createdAt: praise.createdAt,
          reason: praise.reason,
          giver,
          receiver,
          sourceId: praise.sourceId,
          sourceName: praise.sourceName,
        };
      })
    );

    console.log(`\nParsed ${praiseData.length} praise.`);
    console.log('Saving to database.');

    await PraiseModel.insertMany(data);

    console.log('👍 SUCCESS!');
  } catch (e: any) {
    console.log('\n🛑 ERRROR!\n');
    console.error(e.name + ': ' + e.message);
  }

  process.exit();
};

connectDatabase('localhost').then(() => {
  const args = process.argv.slice(2);
  if (args.length == 0) {
    console.log('Usage: yarn workspace api import-praise [FILE] [OPTIONS]');
    console.log(
      'Options: \n--sloppy - Skip null account ids instead of terminating import'
    );
  }
  if (args.length > 2) {
    console.log(
      'Too many arguments! Script accepts two arguments only - the filename containing the praise import data and option "--sloppy".'
    );
    process.exit();
  }
  const praiseDataFile = args[0];
  const praiseData = JSON.parse(
    fs.readFileSync(path.resolve(__dirname, praiseDataFile), {
      encoding: 'utf-8',
    })
  );

  let sloppyImport = false;
  if (args[1] === '--sloppy') {
    sloppyImport = true;
  }
  console.log('Parsing praise …');
  importPraise(praiseData, sloppyImport);
});
