#!/bin/bash
if  [[ $1 = "--latest" ]]; then
  echo "Using latest version"
  VERSION="latest"
  IMAGE=$( docker images | grep ghcr.io/givepraise/praise/latest/setup:latest )
  if [ -z "$IMAGE" ]
  then
    echo "Pulling the setup image..."
    docker image pull ghcr.io/givepraise/praise/latest/setup:latest
  fi
  docker run -it -v $(pwd):/usr/praise ghcr.io/givepraise/praise/latest/setup:latest
else
  echo "Using release version"
  VERSION="release"
  IMAGE=$( docker images | grep ghcr.io/givepraise/praise/setup:latest )
  if [ -z "$IMAGE" ]
  then
    echo "Pulling the setup image..."
    docker image pull ghcr.io/givepraise/praise/setup:latest
  fi
  docker run -it -v $(pwd):/usr/praise ghcr.io/givepraise/praise/setup:latest
fi

