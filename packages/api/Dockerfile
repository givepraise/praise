FROM node:16.17.1-alpine

# Create app directory
WORKDIR /usr/src/

# Copy workspace config
COPY ./package*.json .
COPY ./.yarnrc.yml .
COPY ./yarn.lock .
COPY ./.yarn ./.yarn

# Copy packages
COPY ./packages/api ./packages/api

# Install dependencies for packages
RUN yarn set version berry
RUN yarn

# Run the app
CMD ["yarn", "api:start"]