import { Client, Util } from 'discord.js';
import { PraiseModel } from '../../praise/entities';

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
      const parsedSourceId = s.sourceId.match(/DISCORD:[\d]+:([\d]+)/);

      if (!parsedSourceId)
        throw Error('Failed to parse discord channel id from source id');

      const channel = await discordClient.channels.fetch(parsedSourceId[1]);

      if (!channel) throw Error('Failed to fetch channel from discord api');
      if (!channel.isText()) throw Error('Channel must be a TextChannel');

      const reasonRealized = Util.cleanContent(s.reason, channel);

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
