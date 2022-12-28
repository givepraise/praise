#!/bin/bash

# Define Variables
WORKING_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )
PRAISE_HOME="$(dirname "${WORKING_DIR}")"

# Define Random Passwords
MONGO_INITDB_ROOT_PASSWORD=$(cat /dev/urandom | tr -dc '[:alpha:]' | fold -w ${1:-32} | head -n 1)
MONGO_PASSWORD=$(cat /dev/urandom | tr -dc '[:alpha:]' | fold -w ${1:-32} | head -n 1)
JWT_SECRET=$(cat /dev/urandom | tr -dc '[:alpha:]' | fold -w ${1:-32} | head -n 1)

# Define Random Ports
MONGO_PORT=27017
API_PORT=8080
FRONTEND_PORT=3000

installQuestions() {

    echo "Welcome to the Praise Setup!"
    echo "I need to ask you a few questions before starting the setup."
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

## Configure Praise
configure_praise () {
    echo "
###########################################################################
## GENERAL ##

# Running through Docker: NODE_ENV=production
NODE_ENV=$NODE_ENV

###########################################################################
## DATABASE ##

# Running through Docker: MONGO_HOST=mongodb
# Running outside Docker: MONGO_HOST=localhost
MONGO_HOST=mongodb
MONGO_DB=praise_db
MONGO_PORT=$MONGO_PORT
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
API_PORT=$API_PORT

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
FRONTEND_PORT=$FRONTEND_PORT

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

praise_env () {
    echo "Please choose which env you want to install"
    echo "1) production (Stable)"
    echo "2) staging (Dev)"
    read -rp "Please select which number [1/2]: " -e -i "1" env
    until [[ "$env" =~ ^[12]*$ ]]; do
        echo "$env: invalid selection."
        read -rp "Confirm Praise env? [1/2]: " -e -i "1" env
    done
    if [[ "$env" =~ ^[1]$ ]]; then
        export NODE_ENV=production
        echo $NODE_ENV
        sleep 1
    elif [[ "$env" =~ ^[2]$ ]]; then
        export NODE_ENV=development
        echo $NODE_ENV
        sleep 1
    else
        echo "Invalid Option, Praise Setup Aborted"
        sleep 1
        exit 0
    fi
}

main () {
    praise_env
    installQuestions
    configure_praise
}

main
