# How to install Praise on Digital Ocean - A minimal guide

## Create a Droplet

When writing this guide we used the following Droplet config:

- Ubuntu 20.04 (LTS) x64
- 80 GB disk
- 4 GB memory

Praise might well run on a smaller setup as well, that is yet to be determined though.

## Use ssh to access Droplet

```
ssh root@xxx.xxx.xxx.xxx
```

This guide installs Praise under the root user, making no effort to secure the server. The following steps are optional but highly recommended:

- [Set up a firewall plus a user account with reduced privileges](digital-ocean-initial-setup.md)

## Install Docker

The Praise database tuns on MongoDB, managed by Docker.

Complete step 1-2 of the installation guide: [How To Install and Use Docker on Ubuntu 20.04](https://www.digitalocean.com/community/tutorials/how-to-install-and-use-docker-on-ubuntu-20-04)

- Step 1 — Installing Docker
- Step 2 — Executing the Docker Command Without Sudo

⚠ If ou are using `ufw` as firewall, [additional configuration of Docker is needed](configure-ufw-for-docker.md).

## Install Docker Compose

Docker compose is utility for configuring and running Docker containers. Praise requires `docker compose` v2 to be installed.

Complete step 1 in the installation guide: [How To Install and Use Docker Compose on Ubuntu 20.04](https://www.digitalocean.com/community/tutorials/how-to-install-and-use-docker-compose-on-ubuntu-20-04)

- Step 1 — Installing Docker Compose

## Pull Praise repository from GitHub

Clone the Praise repository from GitHub:

```
git clone https://github.com/CommonsBuild/praise.git
```

## Configure the database and server name

Make a copy of the env template file:

```
cp .env.template .env
nano .env
```

Configure the `HOST` variable with the domain name you would like to run Praise on. For local development, enter `localhost`.

```
HOST=
```

Set database connection parameters. Do not use same username/password for `INITDB` user and regular user.

```
MONGO_DB=praise_db
# Use mongodb when running Praise on Docker, localhost otherwise
MONGO_HOST=mongodb
MONGO_PORT=27017
MONGO_INITDB_ROOT_USERNAME=praiseDbRootUsername
MONGO_INITDB_ROOT_PASSWORD=[any password]
MONGO_USERNAME=praiseDbUsername
MONGO_PASSWORD=[any password]
```

## Configure API

```
cd packages/api/
```

Make a copy of the env template file:

```
cp .env.template .env
nano .env
```

Make sure API is run with production setting:

```
NODE_ENV=production
```

Use same domain name for `COOKIE_DOMAIN` as in `HOST` previously specified.

```
COOKIE_DOMAIN=
```

Replace with an ethereum address to access Praise dashboard as Admin:

```
ADMINS=0x123...456
```

## Configure Discord bot

```
cd packages/discord-bot
```

Make a copy of the env template file:

```
cp .env.template .env
nano .env
```

Make sure API is run with production setting:

```
NODE_ENV=production
```

Configure the bot to access your Discord guild:

```
DISCORD_TOKEN=
DISCORD_CLIENT_ID=
DISCORD_GUILD_ID=
PRAISE_GIVER_ROLE_ID=
```

## Configure frontend

```
cd packages/frontend
```

Make a copy of the env template file:

```
cp .env.template .env.production
nano .env.production
```

For local development, configure `REACT_APP_API_URL` with the server and port api is running on, most likely `http://localhost:8088`. For production, leave empty since api runs on same server domain as the frontend.

```
REACT_APP_API_URL=
```

## Build and run all services

```
docker compose up -d
```

## Finished 🎉

Your praise system should be up and running!
