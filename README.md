![Praise Banner](/media/banner.png)

# Praise

### 🎉 Praise is live! The Token Engineering Commons is the first community to use Praise. To see Praise in action, please join the [TEC Discord](https://discord.tecommons.org) or login to the [Praise Dashboard](https://praise.tecommons.org) using any Ethereum address.

### ℹ️ Praise is under active development, codebase should be considered alpha stage. Breaking changes will happen.

- [About](#about)
  - [Step 1 - Acknowledgement](#step-1---acknowledgement)
  - [Step 2 – Quantification](#step-2---quantification)
  - [Step 3 - Analyze and allocate](#step-3---analyze-and-allocate)
  - [Step 4 – Distribution](#step-4---distribution)
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

### Step 2 - Quantification

A group of appointed quantifiers are responsible for quantifying the generated praise data, valuing each praise against the guidelines set in place by the community. How much is facilitating a workgroup meeting worth compared to let's say mentioning the project on Twitter? All the parameters are configurable and subject to community governance feedback or voting.

The quantifiers work asynchronously at their own pace. Each quantifier only needs to process a little amount of praise data, ensuring a manageable workload for a task that otherwise can become tedious.

### Step 3 - Analyze and allocate

When all praise data for a period have been compiled and quantified, individual token allocations are calculated based on a community specific algorithm.

Praise is built to work in tandem with the RAD - Rewards Analysis Dashboard - that allows for deep analysis of the token distribution. Calculate a Gini index or compare distribution to previous praise periods, the dashboard allows for this and many other kinds of analysis with modular metrics that can be applied.

Experience shows that holding open analysis sessions with the community builds acceptance and avoids groups and individuals feeling left out from getting their fair share of compensation. It also provides a rich cultural feedback loop which can help the community to maintain alignment with their mission.

### Step 4 - Distribution

Configure the RAD to export token a token distribution in any format. The RAD is built in a modular fashion with plugins available for the most common distribution platforms such as Disperse.app, Aragon, 1Hive Gardens, etc.

## Run Praise on a server

We believe in the appropriate amount of decentralisation. Praise is not an onchain tool built on top of Ethereum. Instead, every community runs its own server. The longterm goal is to provide a 30 minute installation similar to [that of the forum software Discourse](https://github.com/discourse/discourse/blob/main/docs/INSTALL-cloud.md).

Until that has been implemented, we provide a guide for an installation that will take slightly longer than 30 mins. The installation process is tested on a Digital Ocean droplet but should with little modifications work for any Ubuntu server.

[How to install Praise on Digital Ocean](/packages/docs/install-praise-on-digital-ocean.md)

## Run Praise locally

Prerequisites:

- `node`
- `nvm`
- `yarn`
- `docker`

### 1. Switch to specified node version

```
nvm use
```

### 2. Install dependencies

```
yarn set version berry
yarn
```

### 3. Create Discord Bot

Create and setup the Discord bot. Be sure to take not of ENV variables during setup as these will be needed during the next step.

[Create the Praise Discord bot](/packages/docs/create-discord-bot.md)

### 4. Configure environment

Run the Praise setup script to configure the runtime environment:

```
sh setup.sh
```

### 5. Start MongoDB

Run mongo:

```
yarn mongodb:start
```

### 6. Build and start api backend

Api, discord-bot and frontend can also be started from the Visual Studio Code Launch menu.

```
yarn workspace api build
yarn workspace api start
```

### 7. Build and start Discord bot

```
yarn workspace discord-bot build
yarn workspace discord-bot start
```

### 8. Build and start frontend

```
yarn workspace frontend build
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
