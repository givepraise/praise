import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v9';
import fs from 'fs';

const args = process.argv.slice(2);
if (args.length != 2) {
  console.log('deploy-commands accepts two arguments, token and client id ');
  process.exit();
}
const token = args[0];
const clientId = args[1];

const commands = [];
const commandFiles = fs
  .readdirSync('./src/bots/discord/commands')
  .filter((file) => file.endsWith('.ts'));

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  console.log(`Adding command: ${command.data.name}`);
  commands.push(command.data.toJSON());
}

const rest = new REST({ version: '9' }).setToken(token);

(async () => {
  try {
    console.log('Started refreshing application (/) commands.');

    await rest.put(Routes.applicationCommands(clientId), {
      body: commands,
    });

    console.log('Successfully reloaded application (/) commands.');
  } catch (error) {
    console.error(error);
  }
})();
