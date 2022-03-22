# How to install Praise on Digital Ocean

## Create a Droplet

When writing this guide we used the following Droplet config:

- Ubuntu 20.04 (LTS) x64
- 80 GB disk
- 4 GB memory

Praise might well run on a smaller setup as well, that is yet to be determined though.

## Initial server setup

Follow **all steps** setup guide provided by Digital Ocean: [Initial Server Setup with Ubuntu 20.04](https://www.digitalocean.com/community/tutorials/initial-server-setup-with-ubuntu-20-04)

- Step 1 — Logging in as root
- Step 2 — Creating a New User
- Step 3 — Granting Administrative Privileges
- Step 4 — Setting Up a Basic Firewall
- Step 5 — Enabling External Access for Your Regular User

## Set up Nginx

Follow steps 1-5 of this guide: [How To Install Nginx on Ubuntu 20.04](https://www.digitalocean.com/community/tutorials/how-to-install-nginx-on-ubuntu-20-04)

- Step 1 – Installing Nginx
- Step 2 – Adjusting the Firewall
- Step 3 – Checking your Web Server
- Step 4 – Managing the Nginx Process
- Step 5 – Setting Up Server Blocks (**With modifications**, see below)

### Step 5 modifications

We recommend using the `/var/www/praise` as install location for praise.

Use the following block config for `/etc/nginx/sites-available/praise`:

```
server {
  listen 80;
  listen [::]:80;

  root /var/www/praise/packages/frontend/build;
  index index.html;

  server_name praise www.praise;

  location /api {
    proxy_pass http://localhost:8088;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
  }

  location / {
    try_files $uri /index.html;
  }
}
```

## Setup Let's encrypt

//TODO Write this section.

## Remove default Nginx startpage

Nginx comes with a default startpage that runs on port 80. Remove that:

```
sudo rm /etc/nginx/sites-enabled/default
```

## Install nvm and Node.js

A shell script is available for the installation of nvm on the Ubuntu 20.04 Linux system. Open a terminal on your system or connect a remote system using SSH. Use the following commands to install curl on your system, then run the nvm installer script.

```
sudo apt install curl
curl https://raw.githubusercontent.com/creationix/nvm/master/install.sh | bash
```

The nvm installer script creates environment entry to login script of the current user. You can either logout and login again to load the environment or execute the below command to do the same.

```
source ~/.profile
```

Now you can access `nvm`. Proceed to install the version of Node required by Praise.

```
nvm install 16.13.2
```

Verify installation has completed successfully by running the following command:

```
node -v
```

Expected output:

```
v16.3.2
```

## Install PM2

PM2 manages the `api` and `discord-bot` Node processes for us.

Installation guide: [How To Set Up a Node.js Application for Production on Ubuntu 20.04](https://www.digitalocean.com/community/tutorials/how-to-set-up-a-node-js-application-for-production-on-ubuntu-20-04)

Here, you only need to follow the instructions in step 3, the other steps are alredy completed.

## Install Docker

The Praise database tuns on MongoDB, managed by Docker.

Complete step 1-2 of the installation guide: [How To Install and Use Docker on Ubuntu 20.04](https://www.digitalocean.com/community/tutorials/how-to-install-and-use-docker-on-ubuntu-20-04)

- Step 1 — Installing Docker
- Step 2 — Executing the Docker Command Without Sudo

## Install Docker Compose

Docker compose is utility for configuring and running Docker containers.

Complete step 1 in the installation guide: [How To Install and Use Docker Compose on Ubuntu 20.04](https://www.digitalocean.com/community/tutorials/how-to-install-and-use-docker-compose-on-ubuntu-20-04)

- Step 1 — Installing Docker Compose

## Configure Docker to work with ufw firewall

Docker does not work well with the ufw firewall without some configuration. Read more about these issues on [stackoverflow](https://stackoverflow.com/questions/30383845/what-is-the-best-practice-of-docker-ufw-under-ubuntu).

Edit ufw rules:

```
nano /etc/ufw/after.rules
```

Add the following section to the end of the file to block connection requests initiated by all public networks, but allow internal networks to access external networks:

```
# BEGIN UFW AND DOCKER
*filter
:ufw-user-forward - [0:0]
:DOCKER-USER - [0:0]
-A DOCKER-USER -j RETURN -s 10.0.0.0/8
-A DOCKER-USER -j RETURN -s 172.16.0.0/12
-A DOCKER-USER -j RETURN -s 192.168.0.0/16

-A DOCKER-USER -j ufw-user-forward

-A DOCKER-USER -j DROP -p tcp -m tcp --tcp-flags FIN,SYN,RST,ACK SYN -d 192.168.0.0/16
-A DOCKER-USER -j DROP -p tcp -m tcp --tcp-flags FIN,SYN,RST,ACK SYN -d 10.0.0.0/8
-A DOCKER-USER -j DROP -p tcp -m tcp --tcp-flags FIN,SYN,RST,ACK SYN -d 172.16.0.0/12
-A DOCKER-USER -j DROP -p udp -m udp --dport 0:32767 -d 192.168.0.0/16
-A DOCKER-USER -j DROP -p udp -m udp --dport 0:32767 -d 10.0.0.0/8
-A DOCKER-USER -j DROP -p udp -m udp --dport 0:32767 -d 172.16.0.0/12

-A DOCKER-USER -j RETURN
COMMIT
# END UFW AND DOCKER
```

Restart ufw for changes to take effect:

```
sudo systemctl restart ufw
```

## Pull Praise repository from GitHub

Clone the Praise repository from GitHub:

```
cd /var/www
git clone https://github.com/CommonsBuild/praise.git
```

## Install Yarn

```
npm install --global yarn
```

Run the `yarn` command to install and link all dependencies.

```
cd praise
yarn
```

## Configure the database

Make a copy of the env template file:

```
cp .env.template .env
nano .env
```

Set connection parameters:

```
MONGO_INITDB_ROOT_USERNAME=
MONGO_INITDB_ROOT_PASSWORD=
MONGO_DB_USER=
MONGO_DB_PASSWORD=
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

Replace with an ethereum address to access Praise dashboard as Admin:

```
ADMINS=0x123...456
```

Ensure API can access the database, use same connection parameters as above:

```
MONGO_USERNAME=
MONGO_PASSWORD=
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

Set to the full url where Praise is running.

```
FRONTEND_URL=
```

Ensure API can access the database, use same connection parameters as above:

```
MONGO_USERNAME=
MONGO_PASSWORD=
```

Configure the bot to access your Disxord guild:

```
DISCORD_TOKEN=
DISCORD_CLIENT_ID=
DISCORD_ACTIVATION=
DISCORD_MESSAGE=
DISCORD_LOGO=
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

Set the API url to the following:

```
REACT_APP_BACKEND_URL=/api/
```

## Start MongoDB

From the praise folder, start MongoDB:

```
docker compose up -d
```

The `-d` option means the MongoDB container is run in the background.

## Build api and frontend

```
yarn workspace api build
yarn workspace frontend build
```

## Run api and discord-bot

```
pm2 start pm2.config.js
```

Restart Nginx:

```
sudo systemctl restart nginx
```

## Finished 🎉

Your praise system should be up and running!
