import { SlashCommandBuilder } from '@discordjs/builders';
import { whoisHandler } from '../handlers/whois';
import { Command } from '../interfaces/Command';

export const whois: Command = {
  data: new SlashCommandBuilder()
    .setName('whois')
    .setDescription('Find out details about your community members')
    .addUserOption((option) =>
      option
        .setName('member')
        .setDescription('Mention the member you want to find out about')
        .setRequired(true)
    ),
  async execute(client, interaction, host) {
    if (!interaction.isCommand() || interaction.commandName !== 'whois') return;
    await whoisHandler(client, interaction, host);
  },
};
