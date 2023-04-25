FROM node:18.15-alpine

# Create app directory
WORKDIR /usr/src/

# Copy workspace config
COPY ./package*.json .
COPY ./.eslintrc.js .
COPY ./.yarnrc.yml .
COPY ./yarn.lock .
COPY ./.yarn ./.yarn

# Copy packages
COPY ./packages/api-types ./packages/api-types
COPY ./packages/discord-bot ./packages/discord-bot

# Install dependencies for packages
RUN apk add --no-cache git
RUN corepack enable
RUN yarn

# Run the app
CMD ["yarn", "discord-bot:start"]