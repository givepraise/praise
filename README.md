![Praise Banner](/media/banner.png)

### Unlock the full potential of your community with reputation scores, rewards and deep insights.

Praise is a community intelligence system that promotes active participation and collaboration through peer recognition and rewards. We help communities become more intelligent, productive and inclusive by providing a simple way for community members to acknowledge, praise and reward each other’s contributions.

## How does it work

```
/praise @vitalik.eth for "inventing Ethereum"
```

Community members interact with a Discord Praise bot to acknowledge each other's contributions. This bottom-up approach to value recognition keeps the community engaged and invested. Praise can recognize any contribution, big or small, and even those made outside of any platform. This improves cooperation and promotes a more positive and productive community.

## Who uses Praise?

- [Token Engineering Commons](https://praise.tecommons.org)
- [Commons Stack](https://praise.commonsstack.org)
- [Giveth](https://praise.giveth.io)
- [Gnosis](https://praisegnosisdao.com)


## Run Praise on a server

Please see setup instructions at: https://givepraise.xyz/docs/

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

Create and setup the Discord bot. Be sure to take not of ENV variables during setup as these will be needed during the next step. You need to have administrative access to a Discord server in order to create a bot. Creating a server is free, we recommend setting up a personal server to use for testing purposes. 

[Create the Praise Discord bot](https://givepraise.xyz/docs/server-setup/create-discord-bot)

### 4. Configure environment

Run the Praise setup script to configure the runtime environment:

```
sh setup.sh
```

- Choose `development` on the first question.

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

## How to Contribute

Please see [CONTRIBUTING](CONTRIBUTING.md)

## Contact

Praise is an open source system developed by [General Magic](https://generalmagic.io). To learn more about how Praise could be used in your community please reach out to us!

**Commons Stack**


- [Discord](https://discord.gg/72HUmabwEs)
- [Twitter](https://twitter.com/Generalmagicio)

**Kristofer Lund, PM Praise**

- Telegram: @kristoferkristofer
- Discord: kristofer#1475
