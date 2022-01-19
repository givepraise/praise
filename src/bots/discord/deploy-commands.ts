import { registerCommands } from './utils/registerCommands';

const args = process.argv.slice(2);
if (args.length != 3) {
  console.log('deploy-commands accepts three arguments, token, client id and guild id');
  process.exit();
}
const token = args[0];
const clientId = args[1];
const guildId = args[2];

// Set bot commands
(async() => {
  const registerSuccess = await registerCommands(
    token || "",
    clientId || "",
    guildId
  );
  
  if (registerSuccess) {
    console.info("All bot commands registered in Guild.");
  }
  else {
    console.error("Failed to register bot commands");
  }
})();
