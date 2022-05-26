![Praise Banner](/media/banner.png)

### 🎉 Praise is live! The Token Engineering Commons is the first community to use Praise. To see Praise in action, please join the [TEC Discord](https://discord.tecommons.org) or login to the [Praise Dashboard](https://praise.tecommons.org) using any Ethereum address.

### ℹ️ Praise is under active development, codebase should be considered beta stage.

### 🔗 Full documentation available at [givepraise.xyz](https://givepraise.xyz)

As decentralized organizations grow it becomes more difficult to involve the whole community in determining what contributions to value. Praise invites communities to build a culture of giving and gratitude, involving contributors at every step of the process.

Praise allows communities to acknowledge the full spectrum of value created - ranging from small to large contributions over a number of platforms. Even contributions made outside of any tech platform can be praised.

The praise process has been tried and tested over a number of months in communities such as the TEC - the Token Engineering Commons, Commons Stack and Giveth. The tools developed along the way have now been turned into the open source project Praise.

Praise is similar to a team allocation in other token economies, but done via a unique distributed signal aggregation approach intended to achieve many goals:

- Acknowledge and reward full spectrum contributions
- A clear and transparent process with full community involvement
- Create a culture of giving and gratitude
- Instigate decentralized updates about work being done
- Focus on transparency and data analysis

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

Create and setup the Discord bot. Be sure to take not of ENV variables during setup as these will be needed during the next step.

[Create the Praise Discord bot](https://givepraise.xyz/docs/setup/create-discord-bot)

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
