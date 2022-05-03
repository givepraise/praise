docker build -t praise-setup -f ./packages/setup/Dockerfile .
docker run -it -v $(pwd):/usr/praise praise-setup