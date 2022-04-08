# Praise

### ℹ️ Praise is under active development, codebase should be considered alpha stage. Breaking changes will happen.

Praise invites communities to build a culture of giving and gratitude, involving contributors at every step of the process.

Praise allows communities to acknowledge the full spectrum of value created - ranging from small to large contributions over a number of platforms. Even contributions made outside of any tech platform can be praised.

## Run Praise on a server

We believe in the appropriate amount of decentralisation. Praise is not an onchain tool built on top of Ethereum. Instead, every community runs its own server. The longterm goal is to provide a 30 minute installation similar to [that of the forum software Discourse](https://github.com/discourse/discourse/blob/main/docs/INSTALL-cloud.md).

Until that have been implemented, we provide a guide for an installation that will take slightly longer than 30 mins. The installation process is tested on a Digital Ocean droplet but should with little modifications work for any Ubuntu server.

[How to install Praise on Digital Ocean](/packages/docs/install-digital-ocean.md)

## Run Praise locally

### 1. Switch to specified node version

```
nvm use
```

### 2. Install dependencies

```
yarn
```

### 3. Run MongoDB

Prerequisites:

- Docker installed

Copy root `.env.template` and rename `.env`. Configure database usernames and passwords:

```
MONGO_INITDB_ROOT_USERNAME=
MONGO_INITDB_ROOT_PASSWORD=
MONGO_USERNAME=
MONGO_PASSWORD=
```

Pull mongo image:

```
docker pull mongo
```

Run mongo:

```
yarn mongodb:start
```

### 4. Start api backend

Copy `.env.template` into `.env`:

1. Add your Metamask ETH address to `ADMINS` to be able to access Praise dashboard as admin.
2. Database username / password, same as in root `.env`

Build:

```
yarn workspace api build
```

Start:

```
yarn workspace api start
```

Seed your database with real praise data from the TEC:

```
yarn workspace api import-praise ./sample_data/november.json
yarn workspace api import-praise ./sample_data/december.json
```

### 5. Start Discord bot

Copy `.env.template` into `.env`:

1. `DISCORD_TOKEN` - Your bot's discord token generated via the Discord Developer Portal. You'll need to invite the same bot to your server with the link - `https://discord.com/api/oauth2/authorize?client_id=<client-id>&permissions=378561611840&scope=bot%20applications.commands` (replace `<client-id>` with your bot's client ID), and with the SERVER MEMBERS and MESSAGE CONTENT Intents enabled.
2. `DISCORD_CLIENT_ID` - Your bot's discord client ID, which can be found in the Application settings on Discord Developer Portal
3. `DISCORD_GUILD_ID` - The ID of the server in which you are using the bot. (this can be found by enabling developer mode in Discord, right clicking on te server icon and clicking "Copy Id").
4. `PRAISE_GIVER_ROLE_ID` - The ID of the role whose members can use the praise bot. (This can be found by enabling developer mode in Discord, going to the server settings > roles > <praise-giver-role>, right clicking on the role name and clicking "Copy Id").
5. Database username / password, same as in root `.env`

Build:

```
yarn workspace discord-bot build
```

Start:

```
yarn workspace discord-bot start
```

### 6. Start frontend

Copy `.env.template` and rename `.env.development`.

Build:

```
yarn workspace frontend build
```

Start:

```
yarn workspace frontend start
```

### Documentation

To open docs, run-

```
yarn docs
```

Docs would be hosted at http://localhost:45231
