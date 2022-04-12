![Praise Banner](/media/banner.png)

# Praise

### ℹ️ Praise is under active development, codebase should be considered alpha stage. Breaking changes will happen.

Praise invites communities to build a culture of giving and gratitude, involving contributors at every step of the process.

Praise allows communities to acknowledge the full spectrum of value created - ranging from small to large contributions over a number of platforms. Even contributions made outside of any tech platform can be praised.

## Run Praise on a server

We believe in the appropriate amount of decentralisation. Praise is not an onchain tool built on top of Ethereum. Instead, every community runs its own server. The longterm goal is to provide a 30 minute installation similar to [that of the forum software Discourse](https://github.com/discourse/discourse/blob/main/docs/INSTALL-cloud.md).

Until that have been implemented, we provide a guide for an installation that will take slightly longer than 30 mins. The installation process is tested on a Digital Ocean droplet but should with little modifications work for any Ubuntu server.

[How to install Praise on Digital Ocean](/packages/docs/install-praise-on-digital-ocean.md)

## Run Praise locally

### 1. Switch to specified node version

```
nvm use
```

### 2. Install dependencies

```
yarn
```

### 3. Configure environment

#### `/.env.template`

Copy and rename `.env`.

Set server domain:

```
SERVER=localhost
```

Configure database usernames and passwords:

```
MONGO_DB=praise_db
MONGO_HOST=mongodb
MONGO_PORT=27017
MONGO_INITDB_ROOT_USERNAME=praiseDbRootUsername
MONGO_INITDB_ROOT_PASSWORD=[any password]
MONGO_USERNAME=praiseDbUsername
MONGO_PASSWORD=[any password]
```

#### `/packages/api/.env.template`

Copy and rename `.env`.

Add your Metamask ETH address to `ADMINS` to be able to access Praise dashboard as admin:

```
ADMINS=0x123..123,0x123..12
```

#### `/packages/discord-bot/.env.template`

Copy and rename `.env`.

- `DISCORD_TOKEN` - Your bot's discord token generated via the Discord Developer Portal. You'll need to invite the same bot to your server with the link - `https://discord.com/api/oauth2/authorize?client_id=<client-id>&permissions=378561611840&scope=bot%20applications.commands` (replace `<client-id>` with your bot's client ID), and with the SERVER MEMBERS and MESSAGE CONTENT Intents enabled.
- `DISCORD_CLIENT_ID` - Your bot's discord client ID, which can be found in the Application settings on Discord Developer Portal
- `DISCORD_GUILD_ID` - The ID of the server in which you are using the bot. (this can be found by enabling developer mode in Discord, right clicking on te server icon and clicking "Copy Id").

```
DISCORD_TOKEN=
DISCORD_CLIENT_ID=
DISCORD_GUILD_ID=
```

#### `/packages/frontend/.env.template`

Copy and rename `.env.development`.

### 4. Start MongoDB

Prerequisites:

- Docker installed

Pull mongo image:

```
docker pull mongo
```

Run mongo:

```
yarn mongodb:start
```

### 5. Start api backend

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

### 6. Start Discord bot

Build:

```
yarn workspace discord-bot build
```

Start:

```
yarn workspace discord-bot start
```

### 7. Start frontend

Build:

```
yarn workspace frontend build
```

Start:

```
yarn workspace frontend start
```

### Documentation

To open docs, run:

```
yarn docs
```

Docs would be hosted at http://localhost:45231
