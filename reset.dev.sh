#!/bin/bash
echo
echo "⚠ Running this script will delete ALL Praise data!"  
read -p "Are you sure? (N/y) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]
then
  echo
  echo "Shutting down containers, and removing volumes..."
  echo
  docker compose -f ./docker-compose.development.yml down -v
  echo
  echo "Deleting images..."
  echo
  docker rmi -f $(docker images -aq)
fi
