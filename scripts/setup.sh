#!/bin/bash
IMAGE=$( docker images | grep ghcr.io/commons-stack/praise/setup:latest )
if [ -z "$IMAGE" ]
then
  echo "Pulling the setup image..."
  docker image pull ghcr.io/commons-stack/praise/setup:latest
fi

docker run -it -v $(pwd):/usr/praise ghcr.io/commons-stack/praise/setup:latest