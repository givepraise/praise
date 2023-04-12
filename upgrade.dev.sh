#!/bin/bash
bash ./database-backup.sh
docker compose -f ./docker-compose.development.yml pull
docker compose -f ./docker-compose.development.yml down
docker compose -f ./docker-compose.development.yml up -d --remove-orphans