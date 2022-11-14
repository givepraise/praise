FROM node:16.18-alpine

# Create app directory
WORKDIR /usr/src/

# Copy workspace config
COPY ./package*.json .
COPY ./.eslintrc.js .
COPY ./.yarnrc.yml .
COPY ./yarn.lock .
COPY ./.yarn ./.yarn

# Copy packages
COPY ./packages/api ./packages/api
COPY ./packages/discord-bot ./packages/discord-bot

# Install dependencies for packages
RUN yarn set version berry
RUN yarn
RUN yarn workspace api build

# Run the app
CMD ["yarn", "discord-bot:start"]