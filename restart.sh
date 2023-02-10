#!/bin/bash
if  [[ $1 = "--latest" ]]; then
  echo "Using latest version"
  VERSION="latest"
else
  echo "Using release version"
  VERSION="release"
fi

docker compose -f ./docker-compose.$VERSION.yml down
docker compose -f ./docker-compose.$VERSION.yml up