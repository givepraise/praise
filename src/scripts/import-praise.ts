import PraiseModel from '@entities/Praise';
import UserAccountModel from '@entities/UserAccount';
import { PraiseImportInput } from '@shared/inputs';
import * as dotenv from 'dotenv';
import 'express-async-errors';
import fs from 'fs';
import mongoose, { ConnectOptions } from 'mongoose';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '..', '..', '/.env') });

const importPraise = async (praiseData: PraiseImportInput[]) => {
  try {
    // Filter out invalid praise items
    praiseData = praiseData.filter((praise, index) => {
      process.stdout.write(`Parsing praise ${index}/${praiseData.length}\r`);
      if (!praise.reason || praise.reason === '') {
        console.log(
          `Skipping ${index}: Praise reason "${praise.reason}" is not valid.`
        );
        return false;
      }
      return true;
    });

    const data = await Promise.all(
      praiseData.map(async (praise: PraiseImportInput) => {
        const giver = await UserAccountModel.findOneAndUpdate(
          { id: praise.giver.id },
          praise.giver,
          { upsert: true, new: true }
        );

        const receiver = await UserAccountModel.findOneAndUpdate(
          { id: praise.receiver.id },
          praise.receiver,
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
    console.log(`Saving to database.`);

    await PraiseModel.insertMany(data);

    console.log(`👍 SUCCESS!`);
  } catch (e: any) {
    console.log(`\n\n🛑 ERRROR!\n`);
    console.error(e.name + ': ' + e.message);
  }

  process.exit();
};

mongoose
  .connect(
    process.env.MONGO_DB as string,
    {
      useNewUrlParser: true,
    } as ConnectOptions
  )
  .then(() => {
    const args = process.argv.slice(2);
    if (args.length != 1) {
      console.log(
        'Too many arguments! Script accepts one argument only - the filename containing the praise import data'
      );
      process.exit();
    }
    const praiseDataFile = args[0];

    const praiseData = JSON.parse(
      fs.readFileSync(praiseDataFile, { encoding: 'utf-8' })
    );

    console.log('Parsing praise …');
    importPraise(praiseData);
  });
