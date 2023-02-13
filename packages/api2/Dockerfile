FROM node:16.18-alpine

# COPY --from=docker /usr/local/bin/docker /usr/local/bin/docker
# RUN apk add --no-cache \
#   bash \
#   curl \
#   python \
#   py-pip \
#   make \
#   gcc \
#   libc6-compat \
#   g++ \
#   git \
#   openssh \

# Create app directory
WORKDIR /usr/src/

RUN apk add --no-cache libstdc++

# Copy workspace config
COPY ./package*.json .
COPY ./.yarnrc.yml .
COPY ./yarn.lock .
COPY ./.yarn ./.yarn

# Copy packages
COPY ./packages/api2 ./packages/api2

# Install dependencies for packages
RUN yarn set version berry
RUN yarn

# Run the app
CMD ["yarn", "api:start"]


