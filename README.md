![Praise Banner](/media/banner.png)

# Praise

### ℹ️ Praise is under active development, codebase should be considered alpha stage. Breaking changes will happen.

- [About](#about)
  - [Step 1 - Acknowledgement](#step-1---acknowledgement)
  - [Step 2 – Quantification](#step-2-–-quantification)
  - [Step 3 - Analyze and allocate](#step-3-–-analyze-and-allocate)
  - [Step 4 – Distribution](#step-4-–-distribution)
- [Run Praise on a server](#run-praise-on-a-server)
- [Run Praise locally](#run-praise-locally)

## About

As decentralized organizations grow it becomes more difficult to involve the whole community in determining what contributions to value. Praise invites communities to build a culture of giving and gratitude, involving contributors at every step of the process.

Praise allows communities to acknowledge the full spectrum of value created - ranging from small to large contributions over a number of platforms. Even contributions made outside of any tech platform can be praised.

The praise process has been tried and tested over a number of months in communities such as the TEC - the Token Engineering Commons, Commons Stack and Giveth. The tools developed along the way have now been turned into the open source project Praise.

Praise is similar to a team allocation in other token economies, but done via a unique distributed signal aggregation approach intended to achieve many goals:

- Acknowledge and reward full spectrum contributions
- A clear and transparent process with full community involvement
- Create a culture of giving and gratitude
- Instigate decentralized updates about work being done
- Focus on transparency and data analysis

### Step 1 - Acknowledgement

All community members (or select ones) are allowed to praise contributions. When members get involved in the process, the full spectrum of subjective value being created can be captured.

Praise integrates with the tools you already use daily - Discord currently, Telegram planned for. Praising is easy, just interact with the praise bot!

### Step 2 – Quantification

A group of appointed quantifiers are responsible for quantifying the generated praise data, valuing each praise against the guidelines set in place by the community. How much is facilitating a workgroup meeting worth compared to let's say mentioning the project on Twitter? All the parameters are configurable and subject to community governance feedback or voting.

The quantifiers work asynchronously at their own pace. Each quantifier only needs to process a little amount of praise data, ensuring a manageable workload for a task that otherwise can become tedious.

### Step 3 – Analyze and allocate

When all praise data for a period have been compiled and quantified, individual token allocations are calculated based on a community specific algorithm.

Praise is built to work in tandem with the RAD - Rewards Analysis Dashboard - that allows for deep analysis of the token distribution. Calculate a Gini index or compare distribution to previous praise periods, the dashboard allows for this and many other kinds of analysis with modular metrics that can be applied.

Experience shows that holding open analysis sessions with the community builds acceptance and avoids groups and individuals feeling left out from getting their fair share of compensation. It also provides a rich cultural feedback loop which can help the community to maintain alignment with their mission.

### Step 4 – Distribution

Configure the RAD to export token a token distribution in any format. The RAD is built in a modular fashion with plugins available for the most common distribution platforms such as Disperse.app, Aragon, 1Hive Gardens, etc.

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
HOST=localhost
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

## Contact

Praise is an open source system developed by Commons Stack. To learn more about how Praise could be used in your community please reach out to us!

**Commons Stack**

- [Discord](http://discord.link/commonsstack)
- [Twitter](https://twitter.com/commonsstack)

**Kristofer Lund, PM Praise**

- Telegram: @kristoferkristofer
- Discord: kristofer#1475

![Commons Stack](/media/cs.png)
