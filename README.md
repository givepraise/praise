# Praise

## 1. Install dependencies

```
yarn
```

## 2. Run MongoDB

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

## 3. Start api backend

Copy `.env.template` and rename `.env`.

- Add your Metamask ETH address to `ADMINS` to be able to access Praise dashboard as admin.

Build:

```
yarn workspace api build
```

Start:

```
yarn workspace api start
```

## 4. Start Discord bot

Copy `.env.template` into `.env`.
You would need to set the following variables:
1. `DISCORD_TOKEN` - Your bot's discord token generated via the Discord Developer Portal. You'll need to invite the same bot to your server with the link - `https://discord.com/api/oauth2/authorize?client_id=<client-id>&permissions=8&scope=bot%20applications.commands` (replace `<client-id>` with your bot's client ID), and with the SERVER MEMBERS and MESSAGE CONTENT Intents enabled.
2. `DISCORD_CLIENT_ID` - Your bot's discord client ID, which can be found in the Application settings on Discord Developer Portal
3. `DISCORD_GUILD_ID` - The ID of the server in which you are using the bot. (this can be found by enabling developer mode in Discord, right clicking on te server icon and clicking "Copy Id").
4. `PRAISE_GIVER_ROLE_ID` - The ID of the role whose members can use the praise bot. (This can be found by enabling developer mode in Discord, going to the server settings > roles > <praise-giver-role>, right clicking on the role name and clicking "Copy Id").

Build:

```
yarn workspace discord-bot build
```

Start:

```
yarn workspace discord-bot start
```

## 5. Start frontend

Copy `.env.template` and rename `.env.development`.

Build:

```
yarn workspace frontend build
```

Start:

```
yarn workspace frontend start
```

# VSCode

If you use VSCode, you might want to add the following to `.vscode/settings.json`:

```
{
  "eslint.workingDirectories": [
    {
      "directory": "./packages/api",
      "changeProcessCWD": true
    },
    {
      "directory": "./packages/discord-bot",
      "changeProcessCWD": true
    },
    {
      "directory": "./packages/frontend",
      "changeProcessCWD": true
    }
  ]
}
```

You might also want to add launch configurations to be able to debug frontend and api from within VSCode.

Add to `.vscode/launch.json`:

```
  "configurations": [
    {
      "name": "Launch API",
      "type": "node-terminal",
      "request": "launch",
      "command": "yarn workspace api start:dev",
      "smartStep": false
    },
    {
      "name": "Launch FRONTEND",
      "type": "pwa-chrome",
      "request": "launch",
      "url": "http://localhost:3000",
      "webRoot": "${workspaceFolder}"
    }
  ]
```
