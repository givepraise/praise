import { Client } from 'discord.js';
import { generateReasonRealized } from '@praise/utils/core';
import { PraiseModel } from '@praise/entities';

const up = async (): Promise<void> => {
  const praises = await PraiseModel.find({
    reasonRealized: { $exists: false },
  });

  if (praises.length === 0) return;

  const discordClient = new Client({
    intents: ['GUILDS', 'GUILD_MEMBERS'],
  });

  await discordClient.login(process.env.DISCORD_TOKEN);

  const updates = await Promise.all(
    praises.map(async (s) => {
      const reasonRealized = await generateReasonRealized(
        discordClient,
        s.sourceId,
        s.reason
      );

      return {
        updateOne: {
          filter: { _id: s._id },
          update: { $set: { reasonRealized } },
        },
      };
    })
  );

  await PraiseModel.bulkWrite(updates);
};

const down = async (): Promise<void> => {
  await PraiseModel.updateMany(
    {
      reasonRealized: { $exists: true },
    },
    {
      $unset: { reasonRealized: 1 },
    }
  );
};

export { up, down };
