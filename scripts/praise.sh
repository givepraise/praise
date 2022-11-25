#!/bin/bash

PRAISE_HOME="/opt/praise"
MONGO_INITDB_ROOT_PASSWORD=$(cat /dev/urandom | tr -dc '[:alpha:]' | fold -w ${1:-32} | head -n 1)
MONGO_PASSWORD=$(cat /dev/urandom | tr -dc '[:alpha:]' | fold -w ${1:-32} | head -n 1)
JWT_SECRET=$(cat /dev/urandom | tr -dc '[:alpha:]' | fold -w ${1:-32} | head -n 1)

banner() {

    echo "+++++++++++++++++++++++++++++++++++++++++++++++++++++"
    echo "++++++++++++++++ WELCOME To PRAISE ++++++++++++++++++"
    echo "+++++++++++++++++++++++++++++++++++++++++++++++++++++"
cat << "EOF"
        ___
        (  _`\
        | |_) ) _ __   _ _ (_)
        | ,__/'( '__)/'_` )| |/',__) /'__`\
        | |    | |  ( (_| || |\__, \(  ___/
        (_)    (_)  `\__,_)(_)(____/`\____)

EOF

    echo "+++++++++++++++++++++++++++++++++++++++++++++++++++++"
    echo "++++++++++++++++ WELCOME To PRAISE ++++++++++++++++++"
    echo "+++++++++++++++++++++++++++++++++++++++++++++++++++++"

}
installQuestions() {

    echo "Welcome to the Praise System installer!"
    echo "I need to ask you a few questions before starting the setup."

    # Detect public IPv4 or IPv6 address and pre-fill for the user
    PUBLIC_IP=$(curl ifconfig.me)
    read -rp "IPv4 or IPv6 public address: " -e -i "${PUBLIC_IP}" PUBLIC_IP

    # Ask User for the Desirted Domain Name for the Praise Bot Server
    HOST=""
    read -rp "What would you like the Praise Bot Domain Name to be? " -e -i "${HOST}" HOST
    # Ask the user for the DISCORD TOKEN
    DISCORD_TOKEN=""
    read -rp "What is your Discord Token? " -e -i "${DISCORD_TOKEN}" DISCORD_TOKEN
    # Ask the user for the DISCORD CLIENT ID
    DISCORD_CLIENT_ID=""
    read -rp "What is your Discord Client ID? " -e -i "${DISCORD_CLIENT_ID}" DISCORD_CLIENT_ID
    # Ask the user for the DISCORD GUILD ID
    DISCORD_GUILD_ID=""
    read -rp "What is your Discord Guild ID? " -e -i "${DISCORD_GUILD_ID}" DISCORD_GUILD_ID
    # Ask the user for the ADMINS wallet Address
    ADMINS=""
    read -rp "What will your praise bot server admin wallet address be (Please insert the addresses separated by comma)? " -e -i "${ADMINS}" ADMINS
    echo
    echo "Okay, that was all I needed. We are ready to setup your Praise server now."
    read -n1 -r -p "Press any key to continue..."
}

## Install Prerequisites
install_prerequisites () {
    sudo apt update && apt upgrade -y
    sudo apt install apt-transport-https ca-certificates curl software-properties-common -y
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -
    sudo add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu focal stable"
    sudo apt install docker-ce -y
    sudo systemctl start docker
    sudo systemctl enable docker
    mkdir -p ~/.docker/cli-plugins/
    local COMPOSE_VERSION=$(curl -s https://api.github.com/repos/docker/compose/releases/latest | grep 'tag_name' | cut -d\" -f4)
    curl -SL https://github.com/docker/compose/releases/download/${COMPOSE_VERSION}/docker-compose-`uname -s`-`uname -m` -o ~/.docker/cli-plugins/docker-compose
    chmod +x ~/.docker/cli-plugins/docker-compose
    docker compose version
}

## Configure Firewall
configure_firewall () {
    sudo echo "

###################################
## MANAGED BY PRAISE AUTO-SCRIPT ##
###################################

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
# END UFW AND DOCKER" >> /etc/ufw/after.rules

    sudo ufw disable
    sudo ufw default deny incoming
    sudo ufw default allow outgoing
    sudo ufw allow ssh
    sudo ufw allow http
    sudo ufw allow https
    sudo ufw route allow proto tcp from any to any port 443
    sudo echo "y" | sudo ufw enable
    sudo systemctl restart ufw
}

## Configure Praise
configure_praise () {
    sudo echo "
###########################################################################
## GENERAL ##

# Running through Docker: NODE_ENV=production
NODE_ENV=production

###########################################################################
## DATABASE ##

# Running through Docker: MONGO_HOST=mongodb
# Running outside Docker: MONGO_HOST=localhost
MONGO_HOST=mongodb
MONGO_DB=praise_db
MONGO_PORT=27017
MONGO_INITDB_ROOT_USERNAME=praiseDbRootUsername
MONGO_INITDB_ROOT_PASSWORD=$MONGO_INITDB_ROOT_PASSWORD
MONGO_USERNAME=praiseDbUsername
MONGO_PASSWORD=$MONGO_PASSWORD


###########################################################################
## HOST ##

# The fully qualified domain name for the host where you are running Praise
# For development: HOST=localhost
HOST=$HOST

###########################################################################
## API ##

# Full URL to the host where the API is running.
# When running in development, the URL should also include API_PORT
API_URL=https://$HOST

# The API is accessed on this port. In production this port is not exposed
# externally but API is accessed on {$API_URL}/api
API_PORT=8088

# Comma separated list of ethereum addresses with admnin access to the API
ADMINS=$ADMINS

# API authentication
JWT_SECRET=$JWT_SECRET
# expires after 1 hour of inactivity, or 3 days
JWT_ACCESS_EXP=3600
JWT_REFRESH_EXP=25920000

###########################################################################
## FRONTEND ##

# Full URL to the host (and optionally port) where frontend is being served
FRONTEND_URL=https://$HOST

## FRONTEND - DEVELOPMENT ONLY ##

# Full URL to host where API is running. This variable is not currently used in production.
# Why? The frontend is built as a static website and cannot easily accept
# env variables. There are workarounds but we haven't prioritised to implement them yet.
#
# https://jakobzanker.de/blog/inject-environment-variables-into-a-react-app-docker-on-runtime/
REACT_APP_SERVER_URL=https://$HOST

# Port number used when running frontend for development, outside of Docker
FRONTEND_PORT=3000

###########################################################################
## DISCORD_BOT ##

DISCORD_TOKEN=$DISCORD_TOKEN
DISCORD_CLIENT_ID=$DISCORD_CLIENT_ID
DISCORD_GUILD_ID=$DISCORD_GUILD_ID

###########################################################################
## LOGGING ##

# options: error, warn, info, http, debug
LOGGER_LEVEL=warn" > $PRAISE_HOME/.env
}

## Setup Praise
install_praise () {
    echo
    echo "Checking if Praise is already Installed"
    if [ -d "$PRAISE_HOME" ]; then
        if [ "$(docker ps -q -f name=frontend-praise)" ] || [ "$(docker ps -q -f name=discord-bot-praise)" ] || [ "$(docker ps -q -f name=api-praise)" ] || [ "$(docker ps -q -f name=mongodb-praise)" ]; then
            echo "Praise is already Installed and Running"
        else
            echo "Praise is NOT installed, please install it first to be able to continue with this action"
        fi
    else
        echo "Praise is NOT installed, attempting to install now..."
        echo
        echo "+++++++++++++++++++++++++++++++++++++++++++++++++++++"
        echo "+++++++++++++ Installation Questions ++++++++++++++++"
        echo "+++++++++++++++++++++++++++++++++++++++++++++++++++++"
        installQuestions
        echo "+++++++++++++++++ Questions Done ++++++++++++++++++++"
        echo "+++++++++++++++++++++++++++++++++++++++++++++++++++++"
        echo "++++++++++++ Installing Prerequisites +++++++++++++++"
        echo "+++++++++++++++++++++++++++++++++++++++++++++++++++++"
        install_prerequisites
        echo "++++++++++++++ Prerequisites Installed ++++++++++++++"
        sudo echo "y" | sudo ufw reset
        echo "+++++++++++++++++++++++++++++++++++++++++++++++++++++"
        echo "+++++++++++++++ Configuring Firewall ++++++++++++++++"
        echo "+++++++++++++++++++++++++++++++++++++++++++++++++++++"
        configure_firewall
        echo "++++++++++ Firewall Configuration Complete ++++++++++"
        echo "+++++++++++++++++++++++++++++++++++++++++++++++++++++"
        echo "++++++++++++++++ Cloning Praise Repo ++++++++++++++++"
        echo "+++++++++++++++++++++++++++++++++++++++++++++++++++++"
        git clone https://github.com/CommonsBuild/praise.git $PRAISE_HOME
        echo "+++++++++++++++++++++++++++++++++++++++++++++++++++++"
        echo "++++++++++++++++ Configuring PRAISE +++++++++++++++++"
        echo "+++++++++++++++++++++++++++++++++++++++++++++++++++++"
        configure_praise
        echo "+++++++++++++++++ PRAISE Configured +++++++++++++++++"
        ## Start the server
        echo "+++++++++++++++++++++++++++++++++++++++++++++++++++++"
        echo "++++++++++++++++++ STARTING PRAISE ++++++++++++++++++"
        echo "+++++++++++++++++++++++++++++++++++++++++++++++++++++"
        docker compose -f $PRAISE_HOME/docker-compose.production.yml up -d
        echo "++++++++++++++++++ PRAISE IS UP +++++++++++++++++++++"
        echo "Please point your Praise Domain Name $HOST to $PUBLIC_IP"
    fi
}

setup_praise () {
    echo
    echo "Checking if Praise is already Installed"
    if [ -d "$PRAISE_HOME" ]; then
        if [ "$(docker ps -q -f name=frontend-praise)" ] || [ "$(docker ps -q -f name=discord-bot-praise)" ] || [ "$(docker ps -q -f name=api-praise)" ] || [ "$(docker ps -q -f name=mongodb-praise)" ]; then
            echo "Praise is Installed and Running"
            echo
            echo "Checking if a configuration file exists"
            echo
            if [ -f "$PRAISE_HOME/.env" ]; then
                echo "ENV Exists"
                export $(grep -v '^#' $PRAISE_HOME/.env | xargs)
                echo
                # Detect public IPv4 or IPv6 address and pre-fill for the user
                PUBLIC_IP=$(curl ifconfig.me)
                read -rp "IPv4 or IPv6 public address: " -e -i "${PUBLIC_IP}" PUBLIC_IP
                # Ask User for the Desirted Domain Name for the Praise Bot Server
                HOST=$HOST
                read -rp "What would you like the Praise Bot Domain Name to be? " -e -i "${HOST}" HOST
                # Ask the user for the DISCORD TOKEN
                DISCORD_TOKEN=$DISCORD_TOKEN
                read -rp "What is your Discord Token? " -e -i "${DISCORD_TOKEN}" DISCORD_TOKEN
                # Ask the user for the DISCORD CLIENT ID
                DISCORD_CLIENT_ID=$DISCORD_CLIENT_ID
                read -rp "What is your Discord Client ID? " -e -i "${DISCORD_CLIENT_ID}" DISCORD_CLIENT_ID
                # Ask the user for the DISCORD GUILD ID
                DISCORD_GUILD_ID=$DISCORD_GUILD_ID
                read -rp "What is your Discord Guild ID? " -e -i "${DISCORD_GUILD_ID}" DISCORD_GUILD_ID
                # Ask the user for the ADMINS wallet Address
                ADMINS=$ADMINS
                read -rp "What will your praise bot server admin wallet address be (Please insert the addresses separated by comma)? " -e -i "${ADMINS}" ADMINS
                echo
                echo "Okay, that was all I needed. Praise will be configured using the inputted values"
                read -n1 -r -p "Press any key to continue..."
                configure_praise
                sleep 1
                restart_praise
            else
                echo "Praise Config does not exist"
            fi
        else
            echo "Praise is NOT Running, attempting to start Praise"
            restart_praise
            setup_praise
        fi
    else
        echo
        echo "Praise is NOT installed, please install it first to be able to continue with this action"
        echo
        main
    fi
}

restart_praise () {
    if [ -d "$PRAISE_HOME" ]; then
        docker compose -f $PRAISE_HOME/docker-compose.production.yml down
        sleep 1
        docker compose -f $PRAISE_HOME/docker-compose.production.yml up -d --remove-orphans
    else
        echo
        echo "Praise is NOT installed, please install it first to be able to continue with this action"
        echo
        main
    fi
}

remove_praise () {
    echo
    echo "Checking if Praise is running"
    if [ -d "$PRAISE_HOME" ]; then
        if [ "$(docker ps -q -f name=frontend-praise)" ] || [ "$(docker ps -q -f name=discord-bot-praise)" ] || [ "$(docker ps -q -f name=api-praise)" ] || [ "$(docker ps -q -f name=mongodb-praise)" ]; then
            echo
            echo "Shutting down containers..."
            echo
            docker compose -f $PRAISE_HOME/docker-compose.production.yml down
            echo
            echo "Deleting images..."
            echo
            docker rmi -f $(docker images -aq)
            echo
            echo "Deleting volumes..."
            echo
            docker volume rm $(docker volume ls -q | grep praise)
            echo
            echo "Removing Praise Home..."
            echo
            rm -rf $PRAISE_HOME
        else
            echo "Praise is NOT Running or not Installed Correctly"
        fi
    else
        echo "Praise is NOT Running or not Installed Correctly"
    fi
}

upgrade_praise () {
    echo "Checking if Praise is running"
    if [ -d "$PRAISE_HOME" ]; then
        if [ "$(docker ps -q -f name=frontend-praise)" ] || [ "$(docker ps -q -f name=discord-bot-praise)" ] || [ "$(docker ps -q -f name=api-praise)" ] || [ "$(docker ps -q -f name=mongodb-praise)" ]; then
            cd $PRAISE_HOME
            git pull
            export $(grep -v '^#' $PRAISE_HOME/.env | xargs)
            docker exec -i mongodb-praise /usr/bin/mongodump --authenticationDatabase admin --archive -u $MONGO_INITDB_ROOT_USERNAME -p $MONGO_INITDB_ROOT_PASSWORD --db praise_db > $PRAISE_HOME/database-upgrade-backup-$(date +"%F-%T").archive
            echo "Backup DONE .."
            docker compose -f $PRAISE_HOME/docker-compose.production.yml pull
            docker compose -f $PRAISE_HOME/docker-compose.production.yml down
            docker compose -f $PRAISE_HOME/docker-compose.production.yml up -d --remove-orphans
            echo "Congrats, your praise system is up-to-date"
        else
            echo "Praise is either NOT Running or NOT installed correctly"
        fi
    else
        echo "Praise is either NOT Running or NOT installed correctly"
    fi
}

main () {
    clear
    banner
    echo
	echo "Select one of the below options:"
	echo "   1) Install Praise"
	echo "   2) Upgrade Praise"
	echo "   3) Setup Praise"
    echo "   4) Restart Praise"
	echo "   5) Remove Praise"
    echo "   6) Exit"
	read -p "Answer: " answer
	until [[ -z "$answer" || "$answer" =~ ^[1-6]$ ]]; do
		echo "$answer: invalid selection."
        exit 0
		read -p "Answer: " answer
	done
	case "$answer" in
		1)
            install_praise
		;;
		2)
			echo
            echo "WARNING: This might stop Praise from working for some time"
			read -rp "Are you sure you want to upgrade Praise? [y/N]: " -e -i "y" upgrade
			until [[ "$upgrade" =~ ^[yYnN]*$ ]]; do
				echo "$upgrade: invalid selection."
				read -rp "Confirm Praise removal? [y/N]: " -e -i "y" upgrade
			done
			if [[ "$upgrade" =~ ^[yY]$ ]]; then
                upgrade_praise
                sleep 1
            else
                echo "Praise Upgrade Aborted"
                sleep 1
            fi
            main
		;;
		3)
            setup_praise
		;;
        4)
            restart_praise
        ;;
		5)
            echo
            echo "WARNING: This is a destructive move, removing praise will remove all it's componenets and data."
            echo "This is irriversable"
			read -rp "Are you sure you want to remove Praise? [y/N]: " -e -i "N" remove
			until [[ "$remove" =~ ^[yYnN]*$ ]]; do
				echo "$remove: invalid selection."
				read -rp "Confirm Praise removal? [y/N]: " -e -i "N" remove
			done
			if [[ "$remove" =~ ^[yY]$ ]]; then
                remove_praise
                sleep 1
            else
                echo "Praise Removal Aborted"
                sleep 1
            fi
            main
		;;
		6)
            echo "Goodbye! :)"
            exit 0
		;;
	esac
}

main
