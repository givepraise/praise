import app from '@server';
import logger from '@shared/Logger';
import discordClient from 'src/bots/discord';

// Start the server
const port = Number(process.env.PORT || 3000);
app.listen(port, () => {
  logger.info('Express server started on port: ' + port);
});

// Start Discord bot
const token = process.env.DISCORD_TOKEN;
if (token) {
  // Login to Discord with your client's token
  discordClient.login(token);
} else {
  logger.err('No Discord token set.');
}
