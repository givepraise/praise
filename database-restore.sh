#!/bin/bash
if  [[ $1 = "--latest" ]]; then
  echo "Using latest version"
  VERSION="latest"
else
  echo "Using release version"
  VERSION="release"
fi

if ! test  -f "$1" ; then
  echo "Could not find database backup"
  echo "Usage: database-restore.sh filename\n"
fi
export $(grep -v '^#' ./.env | xargs)
docker compose -f ./docker-compose.$VERSION.yml down -v
docker compose -f ./docker-compose.$VERSION.yml up mongodb -d --remove-orphans
docker exec -i mongodb-praise sh -c 'mongorestore --authenticationDatabase admin --nsInclude=praise_db.* --uri="mongodb://$MONGO_INITDB_ROOT_USERNAME:$MONGO_INITDB_ROOT_PASSWORD@mongodb:$MONGO_PORT/?authSource=admin" --drop --preserveUUID --archive' < $1
docker compose -f ./docker-compose.$VERSION.yml up -d --remove-orphans