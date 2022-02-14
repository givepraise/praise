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

Instructions for setting up a Discord server and installing a bot not yet written.

Build:

```
yarn workspace bot_discord build
```

Start:

```
yarn workspace bot_discord start
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
