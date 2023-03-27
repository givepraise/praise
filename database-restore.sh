#!/bin/bash
if ! test  -f "$1" ; then
  echo "Could not find database backup"
  echo "Usage: database-restore.sh filename\n"
fi
export $(grep -v '^#' .env | xargs)
docker compose -f ./docker-compose.production.yml down mongodb
docker volume rm praise_mongodb_data
docker compose -f ./docker-compose.production.yml up mongodb -d --remove-orphans
docker exec -i mongodb-praise sh -c 'mongorestore --authenticationDatabase admin --nsInclude=$MONGO_DB.* --uri="mongodb://$MONGO_INITDB_ROOT_USERNAME:$MONGO_INITDB_ROOT_PASSWORD@mongodb:$MONGO_PORT/?authSource=admin" --drop --preserveUUID --archive' < $1
