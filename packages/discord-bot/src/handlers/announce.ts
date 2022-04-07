import { UserAccountModel } from 'api/dist/useraccount/entities';
import { UserAccount } from 'api/src/useraccount/types';
import { UserModel } from 'api/dist/user/entities';
import {
  confirmButton,
  cancelButton,
} from '../utils/buttons/confirmationButtons';
import { dmTargetMenu } from '../utils/menus/dmTargetmenu';
import {
  Message,
  CommandInteraction,
  SelectMenuInteraction,
  MessageActionRow,
} from 'discord.js';
import { UserRole } from 'api/dist/user/types';
import { dmTargets } from '../utils/dmTargets';
import { notActivatedError } from '../utils/praiseEmbeds';

export const announcementHandler = async (
  interaction: CommandInteraction
): Promise<void> => {
  const { user } = interaction;
  const ua = {
    accountId: user.id,
    name: user.username + '#' + user.discriminator,
    avatarId: user.avatar,
    platform: 'DISCORD',
  } as UserAccount;
  const userAccount = await UserAccountModel.findOneAndUpdate(
    { accountId: user.id },
    ua,
    { upsert: true, new: true }
  );
  if (!userAccount.user) {
    await interaction.editReply(await notActivatedError());
    return;
  }
  const currentUser = await UserModel.findOne({ _id: userAccount.user });

  if (currentUser?.roles.includes(UserRole.ADMIN)) {
    const message = interaction.options.getString('message');
    const confirmMsg = (await interaction.editReply({
      content: `Preview your message\n\n---\n${
        message || ''
      }\n---\n\nThis is the message that would be sent to the users. Press \`Confirm\` to continue...`,
      components: [
        new MessageActionRow().addComponents([confirmButton, cancelButton]),
      ],
    })) as Message;
    const collector = confirmMsg.createMessageComponentCollector({
      filter: (click) => click.user.id === interaction.user.id,
      time: 900000,
    });
    collector.on('collect', async (click) => {
      await click.deferUpdate();
      switch (click.customId) {
        case 'confirm': {
          await interaction.editReply({
            content: 'Which users do you want to send the message to?',
            components: [new MessageActionRow().addComponents([dmTargetMenu])],
          });
          break;
        }
        case 'cancel': {
          await interaction.editReply({
            content: 'User cancelled Interaction.',
            components: [],
          });
          return;
        }
        case 'dm-menu': {
          if (!click.isSelectMenu()) break;
          const menu: SelectMenuInteraction = click;
          await dmTargets(interaction, menu.values[0], message || '');
          return;
        }
      }
    });
    collector.on('end', async (collected) => {
      const successfulEndEvents = ['cancel', 'dm-menu', 'praise-menu'];
      const ended = collected.some((clk) =>
        successfulEndEvents.includes(clk.customId)
      );
      if (!ended) {
        await interaction.followUp({
          content: 'Interaction timed out...',
          embeds: [],
          components: [],
        });
      }
    });
  } else {
    await interaction.editReply({
      content:
        'You do not have the needed permissions to use this command. If you would like to perform admin actions, you would need to be granted an `ADMIN` role on the Praise Dashboard.',
    });
    return;
  }
};
