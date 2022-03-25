module.exports = {
  apps: [
    {
      name: 'api',
      script: 'yarn workspace api start',
    },
    {
      name: 'discord-bot',
      script: 'yarn workspace discord-bot start',
    },
  ],
};
