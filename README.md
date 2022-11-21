![Praise Banner](/media/banner.png)

### Recognize and reward community contributions, foster a culture of giving and gratitude. 

Some of the communities using Praise:
- [Token Engineering Commons](https://praise.tecommons.org)
- [Commons Stack](https://praise.commonsstack.org)
- [Giveth](https://praise.giveth.io)
- [Gnosis](https://praisegnosisdao.com)

### 🔗 Full documentation available at [givepraise.xyz](https://givepraise.xyz)

As decentralized organizations grow in size, it becomes difficult to involve the community in determining what contributions to value. Praise encourages communities to cultivate a culture of giving and gratitude by recognizing and rewarding contributions.

By listening to what the community values and involving members every step of the way, praise allows bottom-up value systems to emerge. This bottom-up approach to value creation is essential for ensuring that the community remains invested and engaged.

Praise is used to recognize the full range of value created, from minor to major contributions. Contributions made outside of any platform can also be recognized. This promotes a more positive and productive community as a whole.

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

Praise is an open source system developed by Commons Stack. To learn more about how Praise could be used in your community please reach out to us!

**Commons Stack**

- [Discord](http://discord.link/commonsstack)
- [Twitter](https://twitter.com/commonsstack)

**Kristofer Lund, PM Praise**

- Telegram: @kristoferkristofer
- Discord: kristofer#1475

![Commons Stack](/media/cs.png)
