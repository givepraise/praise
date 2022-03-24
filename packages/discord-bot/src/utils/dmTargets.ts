import { CommandInteraction, Message, GuildMember } from 'discord.js';
import { UserModel } from 'api/dist/user/entities';
import { PeriodModel } from 'api/dist/period/entities';
import { User } from 'api/src/user/types';

export const dmTargets = async (
  interaction: CommandInteraction,
  target: string[],
  message: string
): Promise<void> => {
  console.log(target, message);
  switch (target[0]) {
    case 'USERS': {
      const targets = await UserModel.find({});
      const successMsg = 'Sent DM to all praise activated users';
      break;
    }
    case 'QUANTIFIERS': {
      const targets = await UserModel.find({ roles: ['QUANTIFIER'] });
      const successMsg = 'Sent DM to all Quantifiers';
      break;
    }
    case 'DRAFTED-QUANTIFIERS': {
      const latestPeriod = await PeriodModel.find({ status: 'OPEN' });
      console.log(latestPeriod);
      const successMsg = 'Sent DM to all Quantifiers';
      break;
      return;
    }
    case 'PENDING-QUANTIFIERS': {
      return;
    }
  }
};
