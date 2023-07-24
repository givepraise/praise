#!/bin/bash

if ! test -f "$1" ; then
  echo "Could not find database backup"
  echo "Usage: database-restore.sh backup_filename from_database_name [target_database_name]\n"
  exit 1
fi

export $(grep -v '^#' .env | xargs)

FROM_DB_NAME=$2
TARGET_DB_NAME=${3:-$FROM_DB_NAME}

echo "Restoring database from: $FROM_DB_NAME to: $TARGET_DB_NAME"

docker compose -f ./docker-compose.production.yml down mongodb
docker volume rm praise_mongodb_data
docker compose -f ./docker-compose.production.yml up mongodb -d --remove-orphans
docker exec -i mongodb-praise sh -c 'mongorestore --authenticationDatabase admin --nsFrom="'$FROM_DB_NAME'.*" --nsTo="'$TARGET_DB_NAME'.*" --uri="mongodb://$MONGO_INITDB_ROOT_USERNAME:$MONGO_INITDB_ROOT_PASSWORD@mongodb:$MONGO_PORT/?authSource=admin" --drop --preserveUUID --archive' < $1
