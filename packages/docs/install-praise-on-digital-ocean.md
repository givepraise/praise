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

## Configure environment

Run the Praise setup script to configure the runtime environment:

```
sh setup.sh
```

## Build and run all services

```
sh start.sh
```

## Finished 🎉

Your praise system should be up and running!
