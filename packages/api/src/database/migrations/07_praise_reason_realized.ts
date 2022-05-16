import {
  realizeDiscordContent,
  prepareDiscordClient,
} from '@praise/utils/core';
import { PraiseModel } from '@praise/entities';

const up = async (): Promise<void> => {
  const praises = await PraiseModel.find({
    reasonRealized: { $exists: false },
  });

  if (praises.length === 0) return;

  const discordClient = await prepareDiscordClient();

  const updates = await Promise.all(
    praises.map(async (s) => {
      const parsedSourceId = s.sourceId.match(/DISCORD:[\d]+:([\d]+)/);

      if (!parsedSourceId)
        throw Error('Failed to parse discord channel id from source id');

      const reasonRealized = await realizeDiscordContent(
        discordClient,
        parsedSourceId[1],
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
