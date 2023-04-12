FROM node:18.15-alpine

# Create app directory
WORKDIR /usr/src/

# Copy workspace config
COPY ./package*.json .
COPY ./.yarnrc.yml .
COPY ./yarn.lock .
COPY ./.yarn ./.yarn

# Copy packages
COPY ./packages/setup ./packages/setup

# Install dependencies
RUN corepack enable
RUN yarn

# Run the app
CMD ["yarn", "workspace",  "setup",  "start"]