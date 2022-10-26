#!/bin/bash

WORKING_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )
PUBLIC_IP=$(curl ifconfig.me)

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
    cd $WORKING_DIR/praise
    docker run -it --rm -v $(pwd):/usr/praise ghcr.io/commons-stack/praise/setup:latest
}

## Setup Praise
setup_praise () {
    install_prerequisites
    sudo echo "y" | sudo ufw reset
    configure_firewall
    git clone https://github.com/CommonsBuild/praise.git
    configure_praise
    ## Start the server
    docker compose -f $WORKING_DIR/praise/docker-compose.production.yml up -d
}

setup_praise

echo "######################################"
echo "########### PRAISE IS UP #############"
echo "######################################"
echo "Please point your Praise URL $HOSTNAME to $PUBLIC_IP"
